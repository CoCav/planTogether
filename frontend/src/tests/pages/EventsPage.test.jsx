import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EventsPage from "../../pages/EventsPage";

import { EVENT_ROLES } from "../../features/shared/constants/eventRoles";
import { EVENT_STATUS } from "../../features/shared/constants/eventStatus";

import { createPaginatedEventsPayload } from "../factories/events/eventFactory";

import {
    createAuthenticatedTestUser,
    createGuestTestUser,
    expectListingApiCalledWith,
    waitForEmptyListingState
} from "../helpers/pages/eventListingTestHelpers";

/* ==================================================
   EVENTS PAGE TESTS
   Tests public event listing page orchestration and interactions

   Covers:
   - initial and refresh loading states
   - empty states
   - public event rendering
   - empty state rendering
   - API loading params
   - view switching
   - filter submission and reset
   - quick date filters
   - pagination
   - URL synchronization
   - guest login alert
   - current user role forwarding
   - accessible page sections

   Notes:
   - mocks API modules
   - mocks authenticated user state
   - mocks EventCard for role assertions
   - uses MemoryRouter for route query testing
================================================== */

/* =============================
   MOCK DATA
============================= */

const mockGetAllEvents = vi.fn();
const mockFetchAllPaginated = vi.fn();

let mockAuthState = createAuthenticatedTestUser();

const mockToast = {
    success: vi.fn(),
    danger: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
};

const mockHandleJoinEvent = vi.fn();
const mockHandleLeaveEvent = vi.fn();

/* =============================
   MOCKS
============================= */

vi.mock("../../api/events/eventApi", () => ({
    getAllEvents: (...args) => mockGetAllEvents(...args)
}));

vi.mock("../../features/auth/hooks/useAuth", () => ({
    useAuth: () => mockAuthState
}));

vi.mock("../../utils/pagination", () => ({
    fetchAllPaginated: (...args) => mockFetchAllPaginated(...args)
}));

vi.mock("../../features/events/eventNormalizer", () => ({
    normalizePaginatedEvents: (response = {}) => ({
        events: response.events || [],
        page: response.page ?? 1,
        pageSize: response.pageSize ?? 4,
        totalEvents: response.totalEvents ?? response.totalItems ?? 0,
        totalPages: response.totalPages ?? 1,
        message: response.message ?? "",
        success: response.success ?? false
    })
}));

vi.mock("../../components/events/EventCard", () => ({
    default: ({ event, role, onJoin, onLeave }) => (
        <div>
            <span>{event.title}</span>
            <span data-testid={`event-role-${event.id}`}>
                {role || "none"}
            </span>

            <button type="button" onClick={() => onJoin(event.id)}>
                Join
            </button>

            <button type="button" onClick={() => onLeave(event.id)}>
                Leave
            </button>
        </div>
    )
}));

vi.mock("../../hooks/useToast", () => ({
    default: () => mockToast
}));

vi.mock("../../features/eventMemberships/hooks/useMembershipActions", () => ({
    default: (...args) => mockUseMembershipActions(...args)
}));

/* =============================
   TEST HELPERS
============================= */

const createEventsPageResponse = (overrides = {}) =>
    createPaginatedEventsPayload({
        events: [],
        pageSize: 4,

        ...overrides
    });

const LocationDisplay = () => {
    const location = useLocation();

    return <span data-testid="location-search">{location.search}</span>;
};

const renderPage = (initialEntry = "/events") => {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <EventsPage />
            <LocationDisplay />
        </MemoryRouter>
    );
};

const renderAndWaitForEmptyState = async (initialEntry = "/events") => {
    renderPage(initialEntry);

    await waitForEmptyListingState(screen);
};

const mockUseMembershipActions = vi.fn(() => ({
    handleJoinEvent: mockHandleJoinEvent,
    handleLeaveEvent: mockHandleLeaveEvent
}));

describe("EventsPage", () => {

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        mockAuthState = createAuthenticatedTestUser();

        mockGetAllEvents.mockResolvedValue(createEventsPageResponse());
        mockFetchAllPaginated.mockResolvedValue([]);

        mockUseMembershipActions.mockClear();
        mockToast.success.mockClear();
        mockToast.danger.mockClear();
        mockToast.warning.mockClear();
        mockToast.info.mockClear();
    });

    /* =============================
       INITIAL LOADING
    ============================= */

    it("should display initial loading state", () => {
        renderPage();

        expect(screen.getByRole("status")).toHaveTextContent(/loading events/i);

        expect(screen.getByText(/please wait while we fetch the latest events/i)).toBeInTheDocument();
    });

    /* =============================
       EVENT RENDERING
    ============================= */

    it("displays events when API returns data", async () => {
        mockGetAllEvents.mockResolvedValue(
            createEventsPageResponse({
                events: [
                    { id: 1, title: "Event 1", creatorId: 2 },
                    { id: 2, title: "Event 2", creatorId: 2 }
                ],
                totalEvents: 2
            })
        );

        renderPage();

        expect(await screen.findByText("Event 1")).toBeInTheDocument();
        expect(screen.getByText("Event 2")).toBeInTheDocument();
        expect(screen.getByText("(2)")).toBeInTheDocument();
    });

    it("displays total events count from pagination metadata", async () => {
        mockGetAllEvents.mockResolvedValue(
            createEventsPageResponse({
                events: [{ id: 1, title: "Event 1", creatorId: 2 }],
                totalEvents: 12
            })
        );

        renderPage();

        expect(await screen.findByText("(12)")).toBeInTheDocument();
    });

    it("displays empty state when no events are available", async () => {
        await renderAndWaitForEmptyState();

        expect(screen.getByText(/no ongoing events/i)).toBeInTheDocument();
    });

    it("calls events API on load with default params", async () => {
        renderPage();

        await waitFor(() => {
            expectListingApiCalledWith(mockGetAllEvents, {
                page: 1,
                pageSize: 4
            });
        });
    });

    /* =============================
       VIEW SWITCHING
    ============================= */

    it("switches to upcoming view", async () => {
        const user = userEvent.setup();

        await renderAndWaitForEmptyState();

        await user.click(screen.getByRole("tab", { name: /upcoming/i }));

        await waitFor(() => {
            expectListingApiCalledWith(mockGetAllEvents, {
                status: EVENT_STATUS.UPCOMING,
                page: 1,
                pageSize: 4,
                sortBy: "startDateTime",
                order: "asc"
            });
        });
    });

    it("switches to archives view", async () => {
        const user = userEvent.setup();

        await renderAndWaitForEmptyState();

        await user.click(screen.getByRole("tab", { name: /archives/i }));

        await waitFor(() => {
            expectListingApiCalledWith(mockGetAllEvents, {
                status: EVENT_STATUS.PAST,
                page: 1,
                pageSize: 4,
                sortBy: "startDateTime",
                order: "desc"
            });
        });
    });

    it("updates URL when switching view", async () => {
        const user = userEvent.setup();

        await renderAndWaitForEmptyState();

        await user.click(screen.getByRole("tab", { name: /upcoming/i }));

        await waitFor(() => {
            expect(screen.getByTestId("location-search")).toHaveTextContent("view=upcoming");
        });
    });

    it("clears date filters when switching to archives view", async () => {
        const user = userEvent.setup();

        renderPage("/events?date=2026-05-18");

        await screen.findByText(/no events are scheduled for this date/i);

        await user.click(screen.getByRole("tab", { name: /archives/i }));

        await waitFor(() => {
            expectListingApiCalledWith(mockGetAllEvents, {
                status: EVENT_STATUS.PAST,
                page: 1,
                pageSize: 4
            });
        });

        expect(mockGetAllEvents).toHaveBeenLastCalledWith(
            expect.not.objectContaining({
                date: "2026-05-18"
            })
        );
    });

    it("resets sort values when switching views", async () => {
        const user = userEvent.setup();

        renderPage("/events?sortBy=title&order=asc");

        await screen.findByText(/no ongoing events/i);

        await user.click(screen.getByRole("tab", { name: /archives/i }));

        await waitFor(() => {
            expectListingApiCalledWith(mockGetAllEvents, {
                status: EVENT_STATUS.PAST,
                sortBy: "startDateTime",
                order: "desc",
                page: 1,
                pageSize: 4
            });
        });
    });

    it("hides quick filters when switching to archives view", async () => {
        const user = userEvent.setup();

        await renderAndWaitForEmptyState();

        await user.click(screen.getByRole("tab", { name: /archives/i }));

        await waitFor(() => {
            expect(screen.queryByRole("button", { name: /today/i })).not.toBeInTheDocument();
            expect(screen.queryByRole("button", { name: /this weekend/i })).not.toBeInTheDocument();
        });
    });

    /* =============================
       FILTERS
    ============================= */

    it("applies filters using events API", async () => {
        const user = userEvent.setup();

        mockGetAllEvents
            .mockResolvedValueOnce(createEventsPageResponse())
            .mockResolvedValueOnce(
                createEventsPageResponse({
                    events: [{ id: 5, title: "Filtered Event", creatorId: 2 }],
                    totalEvents: 1
                })
            );

        await renderAndWaitForEmptyState();

        await user.click(screen.getByRole("button", { name: /show filters/i }));
        await user.type(screen.getByLabelText(/^search$/i), "music");
        await user.click(screen.getByRole("button", { name: /apply filters/i }));

        await waitFor(() => {
            expectListingApiCalledWith(mockGetAllEvents, {
                search: "music",
                page: 1,
                pageSize: 4
            });
        });

        expect(await screen.findByText("Filtered Event")).toBeInTheDocument();
    });

    it("keeps active view when applying filters", async () => {
        const user = userEvent.setup();

        await renderAndWaitForEmptyState();

        await user.click(screen.getByRole("tab", { name: /upcoming/i }));

        await waitFor(() => {
            expectListingApiCalledWith(mockGetAllEvents, {
                status: EVENT_STATUS.UPCOMING,
                page: 1,
                pageSize: 4
            });
        });

        await user.click(screen.getByRole("button", { name: /show filters/i }));
        await user.type(screen.getByLabelText(/^search$/i), "music");
        await user.click(screen.getByRole("button", { name: /apply filters/i }));

        await waitFor(() => {
            expectListingApiCalledWith(mockGetAllEvents, {
                search: "music",
                status: EVENT_STATUS.UPCOMING,
                page: 1,
                pageSize: 4
            });
        });
    });

    it("resets page when applying filters", async () => {
        const user = userEvent.setup();

        mockGetAllEvents.mockResolvedValue(
            createEventsPageResponse({
                events: [{ id: 1, title: "Event Page 2", creatorId: 2 }],
                page: 2,
                totalPages: 3,
                totalEvents: 10
            })
        );

        renderPage("/events?page=2");

        expect(await screen.findByText("Event Page 2")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /show filters/i }));
        await user.type(screen.getByLabelText(/^search$/i), "music");
        await user.click(screen.getByRole("button", { name: /apply filters/i }));

        await waitFor(() => {
            expectListingApiCalledWith(mockGetAllEvents, {
                search: "music",
                page: 1,
                pageSize: 4
            });
        });
    });

    it("resets filters", async () => {
        const user = userEvent.setup();

        await renderAndWaitForEmptyState();

        await user.click(screen.getByRole("button", { name: /show filters/i }));
        await user.type(screen.getByLabelText(/^search$/i), "music");
        await user.click(screen.getByRole("button", { name: /reset/i }));

        await waitFor(() => {
            expectListingApiCalledWith(mockGetAllEvents, {
                page: 1,
                pageSize: 4
            });
        });
    });

    it("loads events from URL query params", async () => {
        renderPage("/events?view=upcoming&creator=Luffy&page=2");

        await waitFor(() => {
            expectListingApiCalledWith(mockGetAllEvents, {
                creator: "Luffy",
                status: EVENT_STATUS.UPCOMING,
                page: 2,
                pageSize: 4
            });
        });
    });

    it("updates URL when applying filters", async () => {
        const user = userEvent.setup();

        await renderAndWaitForEmptyState();

        await user.click(screen.getByRole("button", { name: /show filters/i }));
        await user.type(screen.getByLabelText(/^search$/i), "music");
        await user.click(screen.getByRole("button", { name: /apply filters/i }));

        await waitFor(() => {
            expect(screen.getByTestId("location-search")).toHaveTextContent("search=music");
        });
    });

    /* =============================
       QUICK FILTERS
    ============================= */

    it("applies Today quick filter", async () => {
        const user = userEvent.setup();

        await renderAndWaitForEmptyState();

        await user.click(screen.getByRole("button", { name: /today/i }));

        await waitFor(() => {
            expectListingApiCalledWith(mockGetAllEvents, {
                date: expect.any(String),
                page: 1,
                pageSize: 4
            });
        });
    });

    it("applies This Weekend quick filter", async () => {
        const user = userEvent.setup();

        await renderAndWaitForEmptyState();

        await user.click(screen.getByRole("button", { name: /this weekend/i }));

        await waitFor(() => {
            expectListingApiCalledWith(mockGetAllEvents, {
                startDate: expect.any(String),
                endDate: expect.any(String),
                page: 1,
                pageSize: 4
            });
        });
    });

    /* =============================
       PAGINATION
    ============================= */

    it("goes to next page", async () => {
        const user = userEvent.setup();

        mockGetAllEvents.mockResolvedValue(
            createEventsPageResponse({
                events: [{ id: 1, title: "Event Page 1", creatorId: 2 }],
                page: 1,
                totalPages: 2,
                totalEvents: 5
            })
        );

        renderPage();

        expect(await screen.findByText("Event Page 1")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /next/i }));

        await waitFor(() => {
            expectListingApiCalledWith(mockGetAllEvents, {
                page: 2,
                pageSize: 4
            });
        });
    });

    it("keeps filters when moving to next page", async () => {
        const user = userEvent.setup();

        mockGetAllEvents
            .mockResolvedValueOnce(createEventsPageResponse())
            .mockResolvedValueOnce(
                createEventsPageResponse({
                    events: [{ id: 1, title: "Filtered Page 1", creatorId: 2 }],
                    page: 1,
                    totalPages: 2,
                    totalEvents: 5
                })
            )
            .mockResolvedValueOnce(
                createEventsPageResponse({
                    events: [{ id: 2, title: "Filtered Page 2", creatorId: 2 }],
                    page: 2,
                    totalPages: 2,
                    totalEvents: 5
                })
            );

        await renderAndWaitForEmptyState();

        await user.click(screen.getByRole("button", { name: /show filters/i }));
        await user.type(screen.getByLabelText(/^search$/i), "music");
        await user.click(screen.getByRole("button", { name: /apply filters/i }));

        expect(await screen.findByText("Filtered Page 1")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /next/i }));

        await waitFor(() => {
            expectListingApiCalledWith(mockGetAllEvents, {
                search: "music",
                page: 2,
                pageSize: 4
            });
        });

        expect(await screen.findByText("Filtered Page 2")).toBeInTheDocument();
    });

    it("updates URL when moving to next page", async () => {
        const user = userEvent.setup();

        mockGetAllEvents.mockResolvedValue(
            createEventsPageResponse({
                events: [{ id: 1, title: "Event Page 1", creatorId: 2 }],
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

    /* =============================
       PAGE ACTIONS
    ============================= */


    it("shows create event link", async () => {
        await renderAndWaitForEmptyState();

        expect(screen.getByRole("link", {
            name: /create event/i
        })).toHaveAttribute("href", "/events/create");
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("renders accessible filter and results sections", async () => {
        await renderAndWaitForEmptyState();

        expect(screen.getByRole("region", {
            name: "Event filters"
        })).toBeInTheDocument();

        expect(screen.getByRole("heading", {
            level: 1,
            name: "Events"
        })).toBeInTheDocument();
    });

    /* =============================
       AUTH STATE
    ============================= */

    it("shows login alert when user is not authenticated", async () => {
        mockAuthState = createGuestTestUser();

        renderPage();

        expect(await screen.findByText(/login to join events/i)).toBeInTheDocument();
    });

    it("does not show login alert when user is authenticated", async () => {
        await renderAndWaitForEmptyState();

        expect(screen.queryByText(/login to join events/i)).not.toBeInTheDocument();
    });

    it("does not load events while auth is loading", () => {
        mockAuthState = {
            user: null,
            loading: true
        };

        renderPage();

        expect(screen.getByRole("status")).toHaveTextContent(/loading events/i);
        expect(mockGetAllEvents).not.toHaveBeenCalled();
        expect(mockFetchAllPaginated).not.toHaveBeenCalled();
    });

    /* =============================
       EVENT ROLES
    ============================= */

    it("passes organizer role to EventCard when current user is event creator", async () => {
        mockGetAllEvents.mockResolvedValue(
            createEventsPageResponse({
                events: [
                    {
                        id: 10,
                        title: "Created Event",
                        creatorId: 1
                    }
                ],
                totalEvents: 1
            })
        );

        renderPage();

        expect(await screen.findByText("Created Event")).toBeInTheDocument();

        expect(screen.getByTestId("event-role-10")).toHaveTextContent(EVENT_ROLES.ORGANIZER);
    });

    it("passes membership role to EventCard from current user events", async () => {
        mockGetAllEvents.mockResolvedValue(
            createEventsPageResponse({
                events: [
                    {
                        id: 20,
                        title: "Joined Event",
                        creatorId: 99
                    }
                ],
                totalEvents: 1
            })
        );

        mockFetchAllPaginated.mockResolvedValue([{
            id: 20,
            role: EVENT_ROLES.PARTICIPANT
        }]);

        renderPage();

        expect(await screen.findByText("Joined Event")).toBeInTheDocument();

        expect(screen.getByTestId("event-role-20")).toHaveTextContent(EVENT_ROLES.PARTICIPANT);
    });

    /* =============================
       MEMBERSHIP ACTIONS
    ============================= */

    it("passes toast to membership actions hook", async () => {
        await renderAndWaitForEmptyState();

        expect(mockUseMembershipActions).toHaveBeenCalledWith(
            expect.objectContaining({
                toast: mockToast,
                getCurrentUserRoleByEvent: expect.any(Function)
            })
        );
    });

    it("forwards join and leave actions to EventCard", async () => {
        const user = userEvent.setup();

        mockGetAllEvents.mockResolvedValue(
            createEventsPageResponse({
                events: [{ id: 1, title: "Action Event", creatorId: 2 }],
                totalEvents: 1
            })
        );

        renderPage();

        expect(await screen.findByText("Action Event")).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Join" }));
        await user.click(screen.getByRole("button", { name: "Leave" }));

        expect(mockHandleJoinEvent).toHaveBeenCalledWith(1);
        expect(mockHandleLeaveEvent).toHaveBeenCalledWith(1);
    });
});
