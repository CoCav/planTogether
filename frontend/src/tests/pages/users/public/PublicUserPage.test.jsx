import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import PublicUserPage from "../../../../pages/users/public/PublicUserPage";

import { getPublicUserProfile, getPublicUserEvents } from "../../../../api/users/userApi";

/* ==================================================
   PUBLIC USER PAGE TESTS
   Tests public user profile and event listing page behavior

   Handles:
   - initial loading state
   - public profile rendering
   - public event rendering
   - empty state rendering
   - default API loading params
   - created / joined view switching
   - pagination
   - URL synchronization
   - error state
   - accessible profile and listing sections
   - public profile statistics semantics

   Notes:
   - mocks public user API
   - mocks EventCard for page-level behavior focus
   - uses MemoryRouter for route params and URL query behavior
================================================== */

/* =============================
   MOCKS
============================= */

vi.mock("../../../../api/users/userApi", () => ({
    getPublicUserProfile: vi.fn(),
    getPublicUserEvents: vi.fn()
}));

vi.mock("../../../../components/events/EventCard", () => ({
    default: ({ event }) => (
        <article>
            <h3>{event.title}</h3>
        </article>
    )
}));

vi.mock("../../../../components/users/UserAvatar", () => ({
    default: ({ src, name, className = "" }) => (
        <img
            src={src}
            alt={`${name} avatar`}
            className={`user-avatar ${className}`.trim()}
        />
    )
}));

vi.mock("../../../../utils/uploadedFiles", () => ({
    getAvatar: vi.fn((avatar) => avatar || "default-avatar.png")
}));

/* =============================
   TEST HELPERS
============================= */

const createProfileResponse = (overrides = {}) => ({
    user: {
        name: "Sakura",
        avatar: "/uploads/avatars/sakura.png"
    },
    stats: {
        createdEventsCount: 17,
        joinedEventsCount: 5
    },
    success: true,
    message: "Public user profile retrieved successfully",
    ...overrides
});

const createEventsResponse = ({
    events = [],
    view = "created",
    page = 1,
    pageSize = 4,
    totalPages = 1,
    totalEvents = events.length
} = {}) => ({
    view,
    page,
    pageSize,
    totalPages,
    totalEvents,
    events,
    success: true,
    message: "Public user events retrieved successfully"
});

const LocationDisplay = () => {
    const location = useLocation();

    return <span data-testid="location-search">{location.search}</span>;
};

const renderPage = (initialEntry = "/users/42") => {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route
                    path="/users/:userId"
                    element={
                        <>
                            <PublicUserPage />
                            <LocationDisplay />
                        </>
                    }
                />
            </Routes>
        </MemoryRouter>
    );
};

const getLastPublicUserEventsCall = () => {
    return getPublicUserEvents.mock.calls.at(-1);
};

const expectLastPublicUserEventsCall = async (expectedUserId, expectedParams) => {
    await waitFor(() => {
        const [userId, params] = getLastPublicUserEventsCall();

        expect(userId).toBe(expectedUserId);
        expect(params).toMatchObject(expectedParams);
    });
};

describe("PublicUserPage", () => {

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        getPublicUserProfile.mockResolvedValue(createProfileResponse());
        getPublicUserEvents.mockResolvedValue(createEventsResponse());
    });

    /* =============================
       INITIAL LOADING / DEFAULT LOAD
    ============================= */

    it("displays loading state initially", () => {
        renderPage();

        expect(screen.getByText(/loading public profile/i)).toBeInTheDocument();
    });

    it("calls APIs with default created view params", async () => {
        renderPage();

        await waitFor(() => {
            expect(getPublicUserProfile).toHaveBeenCalledWith("42");

            expect(getPublicUserEvents).toHaveBeenCalledWith(
                "42",
                expect.objectContaining({
                    view: "created",
                    page: 1,
                    pageSize: 4,
                    sortBy: "startDateTime",
                    order: "asc"
                })
            );
        });
    });

    /* =============================
       PROFILE RENDERING
    ============================= */

    it("renders public profile information", async () => {
        renderPage();

        expect(await screen.findByRole("heading", {
            level: 2,
            name: "Sakura"
        })).toBeInTheDocument();

        const avatar = screen.getByAltText("Sakura avatar");

        expect(avatar).toHaveAttribute("src", "/uploads/avatars/sakura.png");
        expect(avatar).toHaveClass("user-avatar", "public-user-profile-avatar");

        expect(screen.getByText("17")).toBeInTheDocument();
        expect(screen.getByText("created events")).toBeInTheDocument();

        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("joined events")).toBeInTheDocument();
    });

    /* =============================
       EVENT RENDERING / EMPTY STATE
    ============================= */

    it("renders public events returned by API", async () => {
        getPublicUserEvents.mockResolvedValue(
            createEventsResponse({
                events: [
                    {
                        id: 1,
                        title: "Created Event"
                    }
                ],
                totalEvents: 12
            })
        );

        renderPage();

        expect(await screen.findByText("Created Event")).toBeInTheDocument();
        expect(screen.getByText("(12)")).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                level: 2,
                name: /created events/i
            })
        ).toBeInTheDocument();
    });

    it("renders empty state when no public events are returned", async () => {
        renderPage();

        expect(await screen.findByText(/no created events found/i)).toBeInTheDocument();

        expect(screen.getByText(
            "Try browsing another public user event section."
        )).toBeInTheDocument();
    });

    /* =============================
       VIEW SWITCHING
    ============================= */

    it("switches to joined public events view", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByText(/no created events found/i);

        await user.click(screen.getByRole("tab", {
            name: /joined/i
        }));

        expect(
            await screen.findByRole("heading", {
                level: 2,
                name: /joined events/i
            })
        ).toBeInTheDocument();

        await expectLastPublicUserEventsCall("42", {
            view: "joined",
            page: 1,
            pageSize: 4,
            sortBy: "startDateTime",
            order: "asc"
        });
    });

    it("does not reload public profile when switching view", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByText(/no created events found/i);

        expect(getPublicUserProfile).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole("tab", {
            name: /joined/i
        }));

        await waitFor(() => {
            expect(getPublicUserEvents).toHaveBeenCalledTimes(2);
        });

        expect(getPublicUserProfile).toHaveBeenCalledTimes(1);
    });

    it("updates URL when switching to joined view", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByText(/no created events found/i);

        await user.click(screen.getByRole("tab", {
            name: /joined/i
        }));

        await waitFor(() => {
            expect(screen.getByTestId("location-search")).toHaveTextContent("view=joined");
        });
    });

    it("loads public user events from URL query params", async () => {
        renderPage("/users/42?view=joined&page=2&search=music");

        await waitFor(() => {
            expect(getPublicUserEvents).toHaveBeenCalledWith(
                "42",
                expect.objectContaining({
                    view: "joined",
                    page: 2,
                    pageSize: 4,
                    search: "music"
                })
            );
        });
    });

    /* =============================
       PAGINATION
    ============================= */

    it("goes to next page", async () => {
        const user = userEvent.setup();

        getPublicUserEvents
            .mockResolvedValueOnce(
                createEventsResponse({
                    events: [
                        {
                            id: 1,
                            title: "Public Event Page 1"
                        }
                    ],
                    page: 1,
                    totalPages: 2,
                    totalEvents: 6
                })
            )
            .mockResolvedValueOnce(
                createEventsResponse({
                    events: [
                        {
                            id: 2,
                            title: "Public Event Page 2"
                        }
                    ],
                    page: 2,
                    totalPages: 2,
                    totalEvents: 6
                })
            );

        renderPage();

        expect(await screen.findByText("Public Event Page 1")).toBeInTheDocument();

        await user.click(screen.getByRole("button", {
            name: /next/i
        }));

        await expectLastPublicUserEventsCall("42", {
            view: "created",
            page: 2,
            pageSize: 4
        });

        expect(await screen.findByText("Public Event Page 2")).toBeInTheDocument();
    });

    it("updates URL when moving to next page", async () => {
        const user = userEvent.setup();

        getPublicUserEvents.mockResolvedValue(
            createEventsResponse({
                events: [
                    {
                        id: 1,
                        title: "Public Event Page 1"
                    }
                ],
                page: 1,
                totalPages: 2,
                totalEvents: 6
            })
        );

        renderPage();

        expect(await screen.findByText("Public Event Page 1")).toBeInTheDocument();

        await user.click(screen.getByRole("button", {
            name: /next/i
        }));

        await waitFor(() => {
            expect(screen.getByTestId("location-search")).toHaveTextContent("page=2");
        });
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("renders accessible public profile and listing headings", async () => {
        renderPage();

        await screen.findByText(/no created events found/i);

        expect(
            screen.getByRole("heading", {
                level: 1,
                name: "Public Profile"
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                level: 2,
                name: "Sakura"
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                level: 2,
                name: /created events/i
            })
        ).toBeInTheDocument();

        const statsList = screen.getByRole("list", {
            name: /public user statistics/i
        });

        expect(statsList).toBeInTheDocument();

        expect(within(statsList).getAllByRole("listitem")).toHaveLength(2);
    });

    /* =============================
       ERROR HANDLING
    ============================= */

    it("shows error message when loading public profile fails", async () => {
        getPublicUserProfile.mockRejectedValue(new Error("API error"));

        renderPage();

        expect(await screen.findByText(/failed to load public user profile/i)).toBeInTheDocument();
    });

    it("shows error message when refreshing public events fails", async () => {
        const user = userEvent.setup();

        getPublicUserEvents
            .mockResolvedValueOnce(createEventsResponse())
            .mockRejectedValueOnce(new Error("API error"));

        renderPage();

        await screen.findByText(/no created events found/i);

        await user.click(screen.getByRole("tab", {
            name: /joined/i
        }));

        expect(await screen.findByText(/failed to load public user events/i)).toBeInTheDocument();
    });
});
