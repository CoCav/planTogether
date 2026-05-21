import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import EventsPage from "../../pages/EventsPage";

import { EVENT_ROLES } from "../../features/shared/eventRoles";
import { EVENT_STATUS } from "../../features/shared/eventStatus";

import { createPaginatedEventsPayload } from "../factories/events/eventFactory";

import {
    createAuthenticatedTestUser,
    createGuestTestUser,
    expectListingApiCalledWith,
    waitForEmptyListingState
} from "../helpers/pages/eventListingTestHelpers";

/* ==================================================
   EVENTS PAGE TESTS
   Tests public event listing page behavior

   Handles:
   - initial loading state
   - public event rendering
   - empty state rendering
   - API loading params
   - view switching
   - filter submission and reset
   - quick date filters
   - pagination
   - URL synchronization
   - guest login messaging
   - current user role forwarding
   - accessible listing sections
   - accessible listing metadata

   Notes:
   - mocks API modules
   - mocks authenticated user state
   - mocks EventCard for role assertions
   - uses MemoryRouter for URL query behavior
================================================== */

/* =============================
   MOCK DATA
============================= */

const mockGetAllEvents = vi.fn();
const mockFetchAllPaginated = vi.fn();

let mockAuthState = createAuthenticatedTestUser();

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
    getNormalizedEvents: (response) => response.events || []
}));

vi.mock("../../components/events/EventCard", () => ({
    default: ({ event, role }) => (
        <div>
            <span>{event.title}</span>
            <span data-testid={`event-role-${event.id}`}>
                {role || "none"}
            </span>
        </div>
    )
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

const renderLoadedEmptyEventsPage = async (initialEntry = "/events") => {
    renderPage(initialEntry);

    await waitForEmptyListingState(screen);
};

describe("EventsPage", () => {

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        mockAuthState = createAuthenticatedTestUser();

        mockGetAllEvents.mockResolvedValue(createEventsPageResponse());
        mockFetchAllPaginated.mockResolvedValue([]);
    });

    /* =============================
       INITIAL LOADING
    ============================= */

    it("displays loading state initially", () => {
        renderPage();

        expect(screen.getByText(/loading events/i)).toBeInTheDocument();
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
        expect(screen.getByText(/12 events found/i)).toBeInTheDocument();
    });

    it("displays empty state when no events are returned", async () => {
        await renderLoadedEmptyEventsPage();

        expect(screen.getByText(/no events found/i)).toBeInTheDocument();
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

        await renderLoadedEmptyEventsPage();

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

        await renderLoadedEmptyEventsPage();

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

        await renderLoadedEmptyEventsPage();

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

        await screen.findByText(/no events found/i);

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

        await renderLoadedEmptyEventsPage();

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

        await renderLoadedEmptyEventsPage();

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

        await renderLoadedEmptyEventsPage();

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

        await renderLoadedEmptyEventsPage();

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

        await renderLoadedEmptyEventsPage();

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

        await renderLoadedEmptyEventsPage();

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

        await renderLoadedEmptyEventsPage();

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

        await renderLoadedEmptyEventsPage();

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
       ACCESSIBILITY
    ============================= */

    it("renders accessible filter and results sections", async () => {
        await renderLoadedEmptyEventsPage();

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
        await renderLoadedEmptyEventsPage();

        expect(screen.queryByText(/login to join events/i)).not.toBeInTheDocument();
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
});
