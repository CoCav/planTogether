import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useEventListingData from "../../../../features/events/hooks/useEventListingData";

import { getAllEvents } from "../../../../api/events/eventApi";

import useEventMembershipRoles from "../../../../features/eventMemberships/hooks/useEventMembershipRoles";

import { EVENT_STATUS } from "../../../../features/shared/constants/eventStatus";

import { DEFAULT_EVENT_LISTING_FILTERS } from "../../../../features/shared/eventListingDefaults";

/* ==================================================
   USE EVENT LISTING DATA TESTS
   Tests public event listing data loading and pagination

   Handles:
   - public event loading
   - empty param removal
   - filter-only param extraction
   - view-based status params
   - default and custom sort resolution
   - pagination updates
   - membership role loading integration
   - loading and error states

   Notes:
   - mocks API modules
   - mocks membership role hook
   - uses shared default event listing filters
================================================== */

/* =============================
   MOCK DATA
============================= */

const mockLoadMembershipRoles = vi.fn();
const mockGetCurrentUserRoleByEvent = vi.fn();

/* =============================
   MOCKS
============================= */

vi.mock("../../../../api/events/eventApi", () => ({
    getAllEvents: vi.fn()
}));

vi.mock("../../../../features/eventMemberships/hooks/useEventMembershipRoles", () => ({
    default: vi.fn()
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

        useEventMembershipRoles.mockReturnValue({
            loadMembershipRoles: mockLoadMembershipRoles,
            getCurrentUserRoleByEvent: mockGetCurrentUserRoleByEvent
        });

        mockLoadMembershipRoles.mockResolvedValue(undefined);
    });

    /* =============================
       PUBLIC EVENT LOADING
    ============================= */

    it("loads events when no filters are active", async () => {
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
            await result.current.loadData(createFilters(), 1, EVENT_STATUS.ONGOING);
        });

        expect(getAllEvents).toHaveBeenCalledTimes(1);

        expect(result.current.events).toEqual([
            expect.objectContaining({
                id: 1,
                title: "React meetup",
                creatorId: 10
            })
        ]);

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
                EVENT_STATUS.ONGOING
            );
        });

        expect(getAllEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                search: "workshop",
                page: 2,
                pageSize: 4
            })
        );

        expect(result.current.events).toEqual([
            expect.objectContaining({
                id: 2,
                title: "Workshop",
                creatorId: 20
            })
        ]);
    });

    it("removes empty params before calling the API", async () => {
        getAllEvents.mockResolvedValue(createPaginatedEventResponse());

        const { result } = renderUseEventListingData();

        await act(async () => {
            await result.current.loadData(
                createFilters({
                    search: "music",
                    type: "",
                    theme: "   ",
                    location: null
                }),
                1,
                EVENT_STATUS.ONGOING
            );
        });

        expect(getAllEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                search: "music"
            })
        );

        expect(getAllEvents).toHaveBeenCalledWith(
            expect.not.objectContaining({
                type: "",
                theme: "   ",
                location: null
            })
        );
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
                EVENT_STATUS.ONGOING
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

    it("adds upcoming status to API params when the selected view has a status", async () => {
        getAllEvents.mockResolvedValue(createPaginatedEventResponse());

        const { result } = renderUseEventListingData();

        await act(async () => {
            await result.current.loadData(
                createFilters(),
                1,
                EVENT_STATUS.UPCOMING
            );
        });

        expect(getAllEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                status: EVENT_STATUS.UPCOMING,
                page: 1,
                pageSize: 4
            })
        );
    });

    it("uses ongoing view by default when no view is provided", async () => {
        getAllEvents.mockResolvedValue(createPaginatedEventResponse());

        const { result } = renderUseEventListingData();

        await act(async () => {
            await result.current.loadData(createFilters());
        });

        expect(getAllEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                status: EVENT_STATUS.ONGOING,
                sortBy: "startDateTime",
                order: "asc",
                page: 1,
                pageSize: 4
            })
        );
    });

    it("adds ongoing status to API params for ongoing view", async () => {
        getAllEvents.mockResolvedValue(createPaginatedEventResponse());

        const { result } = renderUseEventListingData();

        await act(async () => {
            await result.current.loadData(
                createFilters(),
                1,
                EVENT_STATUS.ONGOING
            );
        });

        expect(getAllEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                status: EVENT_STATUS.ONGOING,
                sortBy: "startDateTime",
                order: "asc"
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
                EVENT_STATUS.ONGOING
            );
        });

        expect(getAllEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                sortBy: "startDateTime",
                order: "asc"
            })
        );
    });

    it("uses custom sort values when filters provide them", async () => {
        getAllEvents.mockResolvedValue(createPaginatedEventResponse());

        const { result } = renderUseEventListingData();

        await act(async () => {
            await result.current.loadData(
                createFilters({
                    sortBy: "createdAt",
                    order: "desc"
                }),
                1,
                EVENT_STATUS.ONGOING
            );
        });

        expect(getAllEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                sortBy: "createdAt",
                order: "desc"
            })
        );
    });

    /* =============================
       PAGINATION
    ============================= */

    it("updates pagination from API response", async () => {
        getAllEvents.mockResolvedValue(
            createPaginatedEventResponse({
                overrides: {
                    page: 3,
                    pageSize: 8,
                    totalPages: 5,
                    totalEvents: 40
                }
            })
        );

        const { result } = renderUseEventListingData({
            pageSize: 8
        });

        await act(async () => {
            await result.current.loadData(createFilters(), 3, EVENT_STATUS.ONGOING);
        });

        const paginationUpdater = setPagination.mock.calls[0][0];

        expect(paginationUpdater({ pageSize: 4 })).toEqual({
            pageSize: 8,
            page: 3,
            totalPages: 5,
            totalEvents: 40
        });
    });

    it("falls back to safe pagination values when API pagination metadata is missing", async () => {
        getAllEvents.mockResolvedValue({
            events: []
        });

        const { result } = renderUseEventListingData({
            pageSize: 6
        });

        await act(async () => {
            await result.current.loadData(createFilters(), 1, EVENT_STATUS.ONGOING);
        });

        const paginationUpdater = setPagination.mock.calls[0][0];

        expect(paginationUpdater({ pageSize: 10 })).toEqual({
            pageSize: 10,
            page: 1,
            totalPages: 1,
            totalEvents: 0
        });
    });

    /* =============================
       MEMBERSHIP ROLES
    ============================= */

    it("loads membership roles after loading events", async () => {
        getAllEvents.mockResolvedValue(
            createPaginatedEventResponse({
                events: [
                    {
                        id: 1,
                        title: "React meetup",
                        creatorId: 10
                    }
                ]
            })
        );

        const { result } = renderUseEventListingData({
            user: {
                userId: 42
            }
        });

        await act(async () => {
            await result.current.loadData(createFilters(), 1, EVENT_STATUS.ONGOING);
        });

        expect(mockLoadMembershipRoles).toHaveBeenCalledTimes(1);
    });

    it("exposes current user role lookup from membership roles hook", () => {
        const { result } = renderUseEventListingData();

        expect(result.current.getCurrentUserRoleByEvent).toBe(mockGetCurrentUserRoleByEvent);
    });

    /* =============================
       ERROR HANDLING
    ============================= */

    it("sets an error message when loading events fails", async () => {
        getAllEvents.mockRejectedValue(new Error("Network error"));

        const { result } = renderUseEventListingData();

        await act(async () => {
            await result.current.loadData(createFilters(), 1, EVENT_STATUS.ONGOING);
        });

        expect(setError).toHaveBeenCalledWith("Failed to load events");
        expect(setLoading).toHaveBeenCalledWith(false);
        expect(setInitialLoading).toHaveBeenCalledWith(false);
    });

    it("sets an error message when membership role loading fails", async () => {
        getAllEvents.mockResolvedValue(createPaginatedEventResponse());

        mockLoadMembershipRoles.mockRejectedValue(new Error("Role loading failed"));

        const { result } = renderUseEventListingData();

        await act(async () => {
            await result.current.loadData(createFilters(), 1, EVENT_STATUS.ONGOING);
        });

        expect(setError).toHaveBeenCalledWith("Failed to load events");
        expect(setLoading).toHaveBeenCalledWith(false);
        expect(setInitialLoading).toHaveBeenCalledWith(false);
    });
});
