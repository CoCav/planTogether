import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, useLocation } from "react-router-dom";

import { getCurrentUserEvents } from "../../../../api/users/userApi";

import MyEventsPage from "../../../../pages/users/authenticated/MyEventsPage";

import { EVENT_ROLES } from "../../../../features/shared/constants/eventRoles";
import { EVENT_STATUS } from "../../../../features/shared/constants/eventStatus";

import useToast from "../../../../hooks/useToast";

/* ==================================================
   MY EVENTS PAGE TESTS
   Tests current user event listing page behavior

   Handles:
   - initial and refresh loading states
   - current user event loading
   - accessible listing sections
   - accessible listing metadata
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

/* =============================
   MOCK DATA
============================= */

let mockAuthState = {
    user: {
        userId: 1
    },
    loading: false
};

const mockToast = {
    success: vi.fn(),
    danger: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
};

const mockHandleJoinEvent = vi.fn();
const mockHandleLeaveEvent = vi.fn();
const mockUseMembershipActions = vi.fn();

/* =============================
   MOCKS
============================= */

vi.mock("../../../../features/auth/hooks/useAuth", () => ({
    useAuth: () => mockAuthState
}));

vi.mock("../../../../api/users/userApi", () => ({
    getCurrentUserEvents: vi.fn()
}));

vi.mock("../../../../features/eventMemberships/hooks/useMembershipActions", () => ({
    default: (...args) => mockUseMembershipActions(...args)
}));

vi.mock("../../../../components/events/EventCard", () => ({
    default: ({ event, role, onLeave }) => (
        <article>
            <h3>{event.title}</h3>

            <span>Role: {role}</span>

            {role !== EVENT_ROLES.ORGANIZER && event.status !== EVENT_STATUS.PAST && (
                <button type="button" onClick={() => onLeave(event.id)}>
                    Leave
                </button>
            )}

            {event.status === EVENT_STATUS.PAST && <span>Ended</span>}
        </article>
    )
}));

vi.mock("../../../../hooks/useToast", () => ({
    default: vi.fn()
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

const getViewTab = (label) => {
    return screen.getAllByRole("tab").find((tab) =>
        tab.textContent.includes(label)
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
            },
            loading: false
        };

        getCurrentUserEvents.mockResolvedValue(createResponse());

        mockUseMembershipActions.mockReturnValue({
            handleJoinEvent: mockHandleJoinEvent,
            handleLeaveEvent: mockHandleLeaveEvent
        });

        useToast.mockReturnValue(mockToast);
    });

    /* =============================
       INITIAL LOADING / DEFAULT LOAD
    ============================= */

    it("displays initial loading state", () => {
        renderPage();

        expect(screen.getByRole("status")).toHaveTextContent(/loading your events/i);
        expect(screen.getByText(/please wait while we fetch your event history/i)).toBeInTheDocument();
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

    it("does not load events while auth is loading", () => {
        mockAuthState = {
            user: null,
            loading: true
        };

        renderPage();

        expect(screen.getByRole("status")).toHaveTextContent(/loading your events/i);
        expect(getCurrentUserEvents).not.toHaveBeenCalled();
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
                        role: EVENT_ROLES.ORGANIZER,
                        status: EVENT_STATUS.UPCOMING
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

    it("displays total events count from pagination metadata", async () => {
        getCurrentUserEvents.mockResolvedValue(
            createResponse({
                events: [
                    {
                        id: 1,
                        title: "Created Event",
                        role: EVENT_ROLES.ORGANIZER,
                        status: EVENT_STATUS.UPCOMING
                    }
                ],
                totalEvents: 12
            })
        );

        renderPage();

        expect(await screen.findByText("(12)")).toBeInTheDocument();
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

        await user.click(getViewTab("Joined"));

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

        await user.click(getViewTab("Created History"));

        expect(
            await screen.findByRole("heading", {
                level: 2,
                name: /created history/i
            })
        ).toBeInTheDocument();

        expect(getViewTab("Created History")).toHaveAttribute("aria-selected", "true");

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

        await user.click(getViewTab("Joined History"));

        expect(
            await screen.findByRole("heading", {
                level: 2,
                name: /joined history/i
            })
        ).toBeInTheDocument();

        expect(getViewTab("Joined History")).toHaveAttribute("aria-selected", "true");

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

        await user.click(getViewTab("Joined"));

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
                        role: EVENT_ROLES.ORGANIZER,
                        status: EVENT_STATUS.UPCOMING
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
                            role: EVENT_ROLES.ORGANIZER,
                            status: EVENT_STATUS.UPCOMING
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
                            role: EVENT_ROLES.ORGANIZER,
                            status: EVENT_STATUS.UPCOMING
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
       ACCESSIBILITY
    ============================= */

    it("renders accessible page landmarks and headings", async () => {
        renderPage();

        await screen.findByText(/no created events/i);

        expect(screen.getByRole("region", {
            name: "My event filters"
        })).toBeInTheDocument();

        expect(screen.getByRole("heading", {
            level: 1,
            name: "My Events"
        })).toBeInTheDocument();
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
                            role: EVENT_ROLES.ORGANIZER,
                            status: EVENT_STATUS.UPCOMING
                        },
                        {
                            id: 2,
                            title: "Joined Mixed Event",
                            role: EVENT_ROLES.PARTICIPANT,
                            status: EVENT_STATUS.UPCOMING
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
                            role: EVENT_ROLES.CO_ORGANIZER,
                            status: EVENT_STATUS.UPCOMING
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

    /* =============================
       MEMBERSHIP ACTIONS
    ============================= */

    it("passes toast to membership actions hook", async () => {
        renderPage();

        await screen.findByText(/no created events/i);

        expect(mockUseMembershipActions).toHaveBeenCalledWith(
            expect.objectContaining({
                toast: mockToast
            })
        );
    });

    it("calls handleLeaveEvent when clicking leave", async () => {
        const user = userEvent.setup();

        getCurrentUserEvents.mockResolvedValue(
            createResponse({
                events: [
                    {
                        id: 2,
                        title: "Joined Event",
                        role: EVENT_ROLES.PARTICIPANT,
                        status: EVENT_STATUS.UPCOMING
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
        getCurrentUserEvents.mockRejectedValue({});

        renderPage();

        expect(await screen.findByText(/failed to load your events/i)).toBeInTheDocument();
    });
});
