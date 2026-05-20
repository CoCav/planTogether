import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";

import MyEventsPage from "../../pages/MyEventsPage";

import { getCurrentUserEvents } from "../../api/users/userApi";

/* ==================================================
   MY EVENTS PAGE TESTS
   Tests current user event listing page behavior

   Handles:
   - initial loading state
   - current user event loading
   - created / joined / history views
   - filters and URL synchronization
   - pagination
   - leave action
   - error state

   Notes:
   - mocks user event API
   - mocks membership actions
   - mocks EventCard for page-level behavior focus
================================================== */

const mockHandleLeaveEvent = vi.fn();

let mockAuthState = {
    user: {
        userId: 1
    }
};

vi.mock("../../features/auth/hooks/useAuth", () => ({
    useAuth: () => mockAuthState
}));

vi.mock("../../api/users/userApi", () => ({
    getCurrentUserEvents: vi.fn()
}));

vi.mock("../../features/eventMemberships/hooks/useMembershipActions", () => ({
    default: () => ({
        handleLeaveEvent: mockHandleLeaveEvent
    })
}));

vi.mock("../../components/events/EventCard", () => ({
    default: ({ event, role, onLeave }) => (
        <article>
            <h3>{event.title}</h3>

            <span>Role: {role}</span>

            {role !== "organizer" && event.status !== "past" && (
                <button type="button" onClick={() => onLeave(event.id)}>
                    Leave
                </button>
            )}

            {event.status === "past" && <span>Ended</span>}
        </article>
    )
}));

/* =============================
   TEST HELPERS
============================= */

const createResponse = ({
    events = [],
    page = 1,
    pageSize = 4,
    totalPages = 1,
    totalEvents = events.length
} = {}) => ({
    events,
    page,
    pageSize,
    totalPages,
    totalEvents,
    success: true,
    message: "Current user events retrieved"
});

const LocationDisplay = () => {
    const location = useLocation();

    return <span data-testid="location-search">{location.search}</span>;
};

const renderPage = (initialEntry = "/my-events") => {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <MyEventsPage />
            <LocationDisplay />
        </MemoryRouter>
    );
};

const getLastCurrentUserEventsCall = () => {
    return getCurrentUserEvents.mock.calls.at(-1)?.[0];
};

const expectLastCurrentUserEventsCall = async (expectedParams) => {
    await waitFor(() => {
        expect(getLastCurrentUserEventsCall()).toMatchObject(expectedParams);
    });
};

const getViewButton = (label) => {
    return screen.getAllByRole("button").find((button) =>
        button.textContent.includes(label)
    );
};

describe("MyEventsPage", () => {

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        mockAuthState = {
            user: {
                userId: 1
            }
        };

        getCurrentUserEvents.mockResolvedValue(createResponse());
    });

    /* =============================
       INITIAL LOADING / DEFAULT LOAD
    ============================= */

    it("displays loading state initially", () => {
        renderPage();

        expect(screen.getByText(/loading your events/i)).toBeInTheDocument();
    });

    it("calls API with default created view params", async () => {
        renderPage();

        await waitFor(() => {
            expect(getCurrentUserEvents).toHaveBeenCalledWith(
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
       EVENT RENDERING / EMPTY STATE
    ============================= */

    it("displays events returned by API", async () => {
        getCurrentUserEvents.mockResolvedValue(
            createResponse({
                events: [
                    {
                        id: 1,
                        title: "Created Event",
                        role: "organizer",
                        status: "upcoming"
                    }
                ],
                totalEvents: 1
            })
        );

        renderPage();

        expect(await screen.findByText("Created Event")).toBeInTheDocument();
        expect(screen.getByText("Role: organizer")).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 2, name: /created events/i })).toBeInTheDocument();
        expect(screen.getByText("(1)")).toBeInTheDocument();
    });

    it("displays empty state when current view has no events", async () => {
        renderPage();

        expect(await screen.findByText(/no created events/i)).toBeInTheDocument();
    });

    /* =============================
       VIEW SWITCHING
    ============================= */

    it("changes view when clicking Joined tab", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByText(/no created events/i);

        await user.click(getViewButton("Joined"));

        expect(
            await screen.findByRole("heading", {
                level: 2,
                name: /joined events/i
            })
        ).toBeInTheDocument();

        await expectLastCurrentUserEventsCall({
            view: "joined",
            page: 1,
            sortBy: "startDateTime",
            order: "asc"
        });
    });

    it("changes view when clicking Created History tab", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByText(/no created events/i);

        await user.click(getViewButton("Created History"));

        expect(
            await screen.findByRole("heading", {
                level: 2,
                name: /created history/i
            })
        ).toBeInTheDocument();

        expect(getViewButton("Created History")).toHaveAttribute("aria-pressed", "true");

        await expectLastCurrentUserEventsCall({
            view: "createdHistory",
            page: 1,
            sortBy: "startDateTime",
            order: "desc"
        });
    });

    it("changes view when clicking Joined History tab", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByText(/no created events/i);

        await user.click(getViewButton("Joined History"));

        expect(
            await screen.findByRole("heading", {
                level: 2,
                name: /joined history/i
            })
        ).toBeInTheDocument();

        expect(getViewButton("Joined History")).toHaveAttribute("aria-pressed", "true");

        await expectLastCurrentUserEventsCall({
            view: "joinedHistory",
            page: 1,
            sortBy: "startDateTime",
            order: "desc"
        });
    });

    /* =============================
       FILTERS / URL SYNC
    ============================= */

    it("calls API with sort params when applying filters", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByText(/no created events/i);

        await user.click(screen.getByRole("button", { name: /show filters/i }));

        await user.selectOptions(
            screen.getByDisplayValue(/soonest first/i),
            "title-asc"
        );

        await user.click(screen.getByRole("button", { name: /apply filters/i }));

        await expectLastCurrentUserEventsCall({
            view: "created",
            page: 1,
            sortBy: "title",
            order: "asc"
        });
    });

    it("loads events from URL query params", async () => {
        renderPage("/my-events?view=joined&creator=Luffy&page=2");

        await waitFor(() => {
            expect(getCurrentUserEvents).toHaveBeenCalledWith(
                expect.objectContaining({
                    view: "joined",
                    creator: "Luffy",
                    page: 2,
                    pageSize: 4
                })
            );
        });
    });

    it("updates URL when switching view", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByText(/no created events/i);

        await user.click(getViewButton("Joined"));

        await waitFor(() => {
            expect(screen.getByTestId("location-search")).toHaveTextContent("view=joined");
        });
    });

    it("updates URL when applying filters", async () => {
        const user = userEvent.setup();

        renderPage();

        await screen.findByText(/no created events/i);

        await user.click(screen.getByRole("button", { name: /show filters/i }));
        await user.type(screen.getByPlaceholderText(/search by creator/i), "Luffy");
        await user.click(screen.getByRole("button", { name: /apply filters/i }));

        await waitFor(() => {
            expect(screen.getByTestId("location-search")).toHaveTextContent("creator=Luffy");
        });
    });

    it("keeps active view when applying filters", async () => {
        const user = userEvent.setup();

        renderPage("/my-events?view=joined");

        await screen.findByText(/no joined events/i);

        await user.click(screen.getByRole("button", { name: /show filters/i }));
        await user.type(screen.getByPlaceholderText(/search by creator/i), "Luffy");
        await user.click(screen.getByRole("button", { name: /apply filters/i }));

        await expectLastCurrentUserEventsCall({
            view: "joined",
            creator: "Luffy",
            page: 1
        });
    });

    it("resets page when applying filters", async () => {
        const user = userEvent.setup();

        renderPage("/my-events?page=2");

        await screen.findByText(/no created events/i);

        await user.click(screen.getByRole("button", { name: /show filters/i }));
        await user.type(screen.getByPlaceholderText(/search by creator/i), "Luffy");
        await user.click(screen.getByRole("button", { name: /apply filters/i }));

        await expectLastCurrentUserEventsCall({
            page: 1,
            creator: "Luffy"
        });
    });

    /* =============================
       PAGINATION
    ============================= */

    it("updates URL when moving to next page", async () => {
        const user = userEvent.setup();

        getCurrentUserEvents.mockResolvedValue(
            createResponse({
                events: [
                    {
                        id: 1,
                        title: "Event Page 1",
                        role: "organizer",
                        status: "upcoming"
                    }
                ],
                page: 1,
                totalPages: 2,
                totalEvents: 5
            })
        );

        renderPage();

        expect(await screen.findByText("Event Page 1")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /next/i }));

        await waitFor(() => {
            expect(screen.getByTestId("location-search")).toHaveTextContent("page=2");
        });
    });

    it("goes to next page", async () => {
        const user = userEvent.setup();

        getCurrentUserEvents
            .mockResolvedValueOnce(
                createResponse({
                    events: [
                        {
                            id: 1,
                            title: "Event Page 1",
                            role: "organizer",
                            status: "upcoming"
                        }
                    ],
                    page: 1,
                    totalPages: 2,
                    totalEvents: 5
                })
            )
            .mockResolvedValueOnce(
                createResponse({
                    events: [
                        {
                            id: 2,
                            title: "Event Page 2",
                            role: "organizer",
                            status: "upcoming"
                        }
                    ],
                    page: 2,
                    totalPages: 2,
                    totalEvents: 5
                })
            );

        renderPage();

        expect(await screen.findByText("Event Page 1")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /next/i }));

        await expectLastCurrentUserEventsCall({
            view: "created",
            page: 2,
            pageSize: 4
        });

        expect(await screen.findByText("Event Page 2")).toBeInTheDocument();
    });

    /* =============================
       ROLE DISPLAY / LEAVE ACTION
    ============================= */

    it("displays mixed event roles with pagination", async () => {
        const user = userEvent.setup();

        getCurrentUserEvents
            .mockResolvedValueOnce(
                createResponse({
                    events: [
                        {
                            id: 1,
                            title: "Created Mixed Event",
                            role: "organizer",
                            status: "upcoming"
                        },
                        {
                            id: 2,
                            title: "Joined Mixed Event",
                            role: "participant",
                            status: "upcoming"
                        }
                    ],
                    page: 1,
                    totalPages: 2,
                    totalEvents: 6
                })
            )
            .mockResolvedValueOnce(
                createResponse({
                    events: [
                        {
                            id: 3,
                            title: "Second Page Event",
                            role: "co_organizer",
                            status: "upcoming"
                        }
                    ],
                    page: 2,
                    totalPages: 2,
                    totalEvents: 6
                })
            );

        renderPage();

        expect(await screen.findByText("Created Mixed Event")).toBeInTheDocument();
        expect(screen.getByText("Joined Mixed Event")).toBeInTheDocument();
        expect(screen.getByText("(6)")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /next/i }));

        await expectLastCurrentUserEventsCall({
            page: 2,
            pageSize: 4
        });

        expect(await screen.findByText("Second Page Event")).toBeInTheDocument();
        expect(screen.getByText("Role: co_organizer")).toBeInTheDocument();
    });

    it("calls handleLeaveEvent when clicking leave", async () => {
        const user = userEvent.setup();

        getCurrentUserEvents.mockResolvedValue(
            createResponse({
                events: [
                    {
                        id: 2,
                        title: "Joined Event",
                        role: "participant",
                        status: "upcoming"
                    }
                ],
                totalEvents: 1
            })
        );

        renderPage();

        expect(await screen.findByText("Joined Event")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /leave/i }));

        expect(mockHandleLeaveEvent).toHaveBeenCalledWith(2);
    });

    /* =============================
       ERROR HANDLING
    ============================= */

    it("shows error message when loading events fails", async () => {
        getCurrentUserEvents.mockRejectedValue(new Error("API error"));

        renderPage();

        expect(await screen.findByText(/failed to load your events/i)).toBeInTheDocument();
    });
});
