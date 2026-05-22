import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useEventListingData from "../../../../features/events/hooks/useEventListingData";

import { getAllEvents } from "../../../../api/events/eventApi";

import useEventMembershipRoles from "../../../../features/eventMemberships/hooks/useEventMembershipRoles";

import { DEFAULT_EVENT_LISTING_FILTERS } from "../../../../features/shared/eventListingDefaults";

/* ==================================================
   USE EVENT LISTING DATA TESTS
   Tests public event listing data loading and pagination

   Handles:
   - public event loading
   - filter-only param extraction
   - view-based status params
   - default sort resolution
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

        expect(result.current.events).toEqual([
            expect.objectContaining({
                id: 2,
                title: "Workshop",
                creatorId: 20
            })
        ]);
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
            await result.current.loadData(createFilters(), 1, "all");
        });

        expect(mockLoadMembershipRoles).toHaveBeenCalledTimes(1);
    });

    it("exposes current user role lookup from membership roles hook", () => {
        const { result } = renderUseEventListingData();

        expect(result.current.getCurrentUserRoleByEvent)
            .toBe(mockGetCurrentUserRoleByEvent);
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
