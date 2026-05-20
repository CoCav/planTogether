import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useEventListingData from "../../../../features/events/hooks/useEventListingData";

import { getAllEvents } from "../../../../api/events/eventApi";
import { getCurrentUserEvents } from "../../../../api/users/userApi";

import { DEFAULT_EVENT_LISTING_FILTERS } from "../../../../features/shared/eventListingDefaults";
import { EVENT_ROLES } from "../../../../features/shared/eventRoles";

import { fetchAllPaginated } from "../../../../utils/pagination";

/* ==================================================
   USE EVENT LISTING DATA TESTS
   Tests public event listing data loading and role mapping

   Handles:
   - public event loading
   - filter-only param extraction
   - view-based status params
   - default sort resolution
   - pagination updates
   - authenticated user membership role mapping
   - organizer role resolution
   - unknown role fallback
   - loading and error states

   Notes:
   - mocks API modules
   - mocks paginated membership fetching
   - uses shared default event listing filters
================================================== */

vi.mock("../../../../api/events/eventApi", () => ({
    getAllEvents: vi.fn()
}));

vi.mock("../../../../api/users/userApi", () => ({
    getCurrentUserEvents: vi.fn()
}));

vi.mock("../../../../utils/pagination", () => ({
    fetchAllPaginated: vi.fn()
}));

vi.mock("../../../../features/events/eventNormalizer", () => ({
    getNormalizedEvents: vi.fn((response) => response.events)
}));

vi.mock("../../../../features/users/authenticated/myEventNormalizer", () => ({
    getMyEventsWithRole: vi.fn()
}));

describe("useEventListingData", () => {
    let setError;
    let setLoading;
    let setInitialLoading;
    let setPagination;

    /* =============================
       TEST DATA
    ============================= */

    const createFilters = (overrides = {}) => ({
        ...DEFAULT_EVENT_LISTING_FILTERS,
        ...overrides
    });

    const createPaginatedEventResponse = ({ events = [], overrides = {} } = {}) => ({
        events,
        page: 1,
        pageSize: 4,
        totalPages: 1,
        totalEvents: events.length,
        success: true,
        message: "Events retrieved",
        ...overrides
    });

    /* =============================
       TEST HELPERS
    ============================= */

    const renderUseEventListingData = (options = {}) => {
        return renderHook(() =>
            useEventListingData({
                user: options.user ?? null,
                pageSize: options.pageSize ?? 4,
                setError,
                setLoading,
                setInitialLoading,
                setPagination
            })
        );
    };

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        setError = vi.fn();
        setLoading = vi.fn();
        setInitialLoading = vi.fn();
        setPagination = vi.fn();
    });

    /* =============================
       PUBLIC EVENT LOADING
    ============================= */

    it("loads all events when no filters are active", async () => {
        getAllEvents.mockResolvedValue(
            createPaginatedEventResponse({
                events: [
                    {
                        id: 1,
                        title: "React meetup",
                        creatorId: 10
                    }
                ],
                overrides: {
                    totalEvents: 1
                }
            })
        );

        const { result } = renderUseEventListingData();

        await act(async () => {
            await result.current.loadData(createFilters(), 1, "all");
        });

        expect(getAllEvents).toHaveBeenCalledTimes(1);

        expect(result.current.events).toEqual([{
            id: 1,
            title: "React meetup",
            creatorId: 10
        }]);

        expect(setError).toHaveBeenCalledWith("");
        expect(setLoading).toHaveBeenCalledWith(true);
        expect(setLoading).toHaveBeenCalledWith(false);
        expect(setInitialLoading).toHaveBeenCalledWith(false);
        expect(setPagination).toHaveBeenCalledWith(expect.any(Function));
    });

    it("loads events with filters when filters are active", async () => {
        getAllEvents.mockResolvedValue(
            createPaginatedEventResponse({
                events: [
                    {
                        id: 2,
                        title: "Workshop",
                        creatorId: 20
                    }
                ],
                overrides: {
                    page: 2,
                    totalPages: 3,
                    totalEvents: 9
                }
            })
        );

        const { result } = renderUseEventListingData();

        await act(async () => {
            await result.current.loadData(
                createFilters({
                    search: "workshop"
                }),
                2,
                "all"
            );
        });

        expect(getAllEvents).toHaveBeenCalledTimes(1);

        expect(getAllEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                search: "workshop",
                page: 2,
                pageSize: 4
            })
        );

        expect(result.current.events).toEqual([{
            id: 2,
            title: "Workshop",
            creatorId: 20
        }]);
    });

    it("does not send non-filter fields as API filters", async () => {
        getAllEvents.mockResolvedValue(createPaginatedEventResponse());

        const { result } = renderUseEventListingData();

        await act(async () => {
            await result.current.loadData(
                createFilters({
                    search: "music",
                    view: "should-not-be-sent",
                    unknownField: "should-not-be-sent"
                }),
                1,
                "all"
            );
        });

        expect(getAllEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                search: "music",
                page: 1,
                pageSize: 4
            })
        );

        expect(getAllEvents).toHaveBeenCalledWith(
            expect.not.objectContaining({
                view: "should-not-be-sent",
                unknownField: "should-not-be-sent"
            })
        );
    });

    it("adds view status to API params when the selected view has a status", async () => {
        getAllEvents.mockResolvedValue(createPaginatedEventResponse());

        const { result } = renderUseEventListingData();

        await act(async () => {
            await result.current.loadData(createFilters(), 1, "upcoming");
        });

        expect(getAllEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                status: expect.any(String),
                page: 1,
                pageSize: 4
            })
        );
    });

    it("uses view default sorting when filters do not provide sort values", async () => {
        getAllEvents.mockResolvedValue(createPaginatedEventResponse());

        const { result } = renderUseEventListingData();

        await act(async () => {
            await result.current.loadData(
                createFilters({
                    sortBy: "",
                    order: ""
                }),
                1,
                "all"
            );
        });

        expect(getAllEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                sortBy: expect.any(String),
                order: expect.any(String)
            })
        );
    });

    /* =============================
       ROLE RESOLUTION
    ============================= */

    it("loads current user event roles when user is authenticated", async () => {
        getAllEvents.mockResolvedValue(
            createPaginatedEventResponse({
                events: [
                    {
                        id: 1,
                        title: "React meetup",
                        creatorId: 10
                    }
                ],
                overrides: {
                    totalEvents: 1
                }
            })
        );

        fetchAllPaginated.mockResolvedValue([{
            id: 1,
            role: EVENT_ROLES.PARTICIPANT
        }]);

        const { result } = renderUseEventListingData({
            user: {
                userId: 42
            }
        });

        await act(async () => {
            await result.current.loadData(createFilters(), 1, "all");
        });

        expect(fetchAllPaginated).toHaveBeenCalledWith({
            fetchPage: getCurrentUserEvents,
            normalizePage: expect.any(Function),
            pageSize: 10
        });

        expect(result.current.getRoleByEventId(1)).toBe(EVENT_ROLES.PARTICIPANT);
    });

    it("resolves organizer role when current user created the event", async () => {
        getAllEvents.mockResolvedValue(
            createPaginatedEventResponse({
                events: [
                    {
                        id: 1,
                        title: "Created event",
                        creatorId: 42
                    }
                ],
                overrides: {
                    totalEvents: 1
                }
            })
        );

        fetchAllPaginated.mockResolvedValue([]);

        const { result } = renderUseEventListingData({
            user: {
                userId: 42
            }
        });

        await act(async () => {
            await result.current.loadData(createFilters(), 1, "all");
        });

        expect(result.current.getRoleByEventId(1)).toBe(EVENT_ROLES.ORGANIZER);
    });

    it("returns null when no user is authenticated", async () => {
        getAllEvents.mockResolvedValue(
            createPaginatedEventResponse({
                events: [
                    {
                        id: 1,
                        title: "Public event",
                        creatorId: 10
                    }
                ],
                overrides: {
                    totalEvents: 1
                }
            })
        );

        const { result } = renderUseEventListingData();

        await act(async () => {
            await result.current.loadData(createFilters(), 1, "all");
        });

        expect(fetchAllPaginated).not.toHaveBeenCalled();
        expect(result.current.getRoleByEventId(1)).toBeNull();
    });

    it("returns null when event id is unknown", async () => {
        getAllEvents.mockResolvedValue(
            createPaginatedEventResponse({
                events: [
                    {
                        id: 1,
                        title: "Known event",
                        creatorId: 10
                    }
                ]
            })
        );

        fetchAllPaginated.mockResolvedValue([]);

        const { result } = renderUseEventListingData({
            user: {
                userId: 42
            }
        });

        await act(async () => {
            await result.current.loadData(createFilters(), 1, "all");
        });

        expect(result.current.getRoleByEventId(999)).toBeNull();
    });

    /* =============================
       ERROR HANDLING
    ============================= */

    it("sets an error message when loading events fails", async () => {
        getAllEvents.mockRejectedValue(new Error("Network error"));

        const { result } = renderUseEventListingData();

        await act(async () => {
            await result.current.loadData(createFilters(), 1, "all");
        });

        expect(setError).toHaveBeenCalledWith("❌ Failed to load events");
        expect(setLoading).toHaveBeenCalledWith(false);
        expect(setInitialLoading).toHaveBeenCalledWith(false);
    });
});
