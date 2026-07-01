import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useMyEventListingData from "../../../../../features/users/authenticated/hooks/useMyEventListingData";

import { getCurrentUserEvents } from "../../../../../api/users/userApi";

import { EVENT_ROLES } from "../../../../../features/shared/constants/eventRoles";

import { createMyEventFilters } from "../../../../factories/users/authenticated/myEventFiltersFactory";

/* ==================================================
   USE MY EVENT LISTING DATA TESTS
   Tests current user event listing data loading

   Handles:
   - current user event loading
   - filter-only param extraction
   - view-based default sorting
   - paginated payload normalization
   - pagination updates
   - local event like state update
   - current user role resolution
   - loading and error states

   Notes:
   - mocks user API module
   - uses reusable current user event filter factory
================================================== */

vi.mock("../../../../../api/users/userApi", () => ({
    getCurrentUserEvents: vi.fn()
}));

describe("useMyEventListingData", () => {
    let setError;
    let setLoading;
    let setInitialLoading;
    let setPagination;

    /* =============================
       TEST DATA
    ============================= */

    const createPaginatedMyEventResponse = ({ events = [], overrides = {} } = {}) => ({
        events,
        page: 1,
        pageSize: 4,
        totalPages: 1,
        totalEvents: events.length,
        success: true,
        message: "Current user events retrieved",
        ...overrides
    });

    /* =============================
       TEST HELPERS
    ============================= */

    const renderUseMyEventListingData = (options = {}) => {
        return renderHook(() =>
            useMyEventListingData({
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
       CURRENT USER EVENT LOADING
    ============================= */

    it("loads current user events", async () => {
        getCurrentUserEvents.mockResolvedValue(
            createPaginatedMyEventResponse({
                events: [
                    {
                        id: 1,
                        title: "Created event",
                        role: EVENT_ROLES.ORGANIZER
                    }
                ],
                overrides: {
                    totalEvents: 1
                }
            })
        );

        const { result } = renderUseMyEventListingData();

        await act(async () => {
            await result.current.loadData(createMyEventFilters(), 1, "created");
        });

        expect(getCurrentUserEvents).toHaveBeenCalledTimes(1);

        expect(result.current.events).toEqual([
            expect.objectContaining({
                id: 1,
                title: "Created event",
                role: EVENT_ROLES.ORGANIZER
            })
        ]);

        expect(setError).toHaveBeenCalledWith("");
        expect(setLoading).toHaveBeenCalledWith(true);
        expect(setLoading).toHaveBeenCalledWith(false);
        expect(setInitialLoading).toHaveBeenCalledWith(false);
        expect(setPagination).toHaveBeenCalledWith(expect.any(Function));
    });

    it("loads current user events with filters and pagination", async () => {
        getCurrentUserEvents.mockResolvedValue(
            createPaginatedMyEventResponse({
                events: [
                    {
                        id: 2,
                        title: "Joined workshop",
                        role: EVENT_ROLES.PARTICIPANT
                    }
                ],
                overrides: {
                    page: 2,
                    totalPages: 3,
                    totalEvents: 9
                }
            })
        );

        const { result } = renderUseMyEventListingData();

        await act(async () => {
            await result.current.loadData(
                createMyEventFilters({
                    search: "workshop"
                }),
                2,
                "joined"
            );
        });

        expect(getCurrentUserEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                view: "joined",
                search: "workshop",
                page: 2,
                pageSize: 4
            })
        );

        expect(result.current.events).toEqual([
            expect.objectContaining({
                id: 2,
                title: "Joined workshop",
                role: EVENT_ROLES.PARTICIPANT
            })
        ]);
    });

    it("does not send non-filter fields as API filters", async () => {
        getCurrentUserEvents.mockResolvedValue(createPaginatedMyEventResponse());

        const { result } = renderUseMyEventListingData();

        await act(async () => {
            await result.current.loadData(
                createMyEventFilters({
                    search: "music",
                    view: "should-not-be-sent",
                    unknownField: "should-not-be-sent"
                }),
                1,
                "created"
            );
        });

        expect(getCurrentUserEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                view: "created",
                search: "music",
                page: 1,
                pageSize: 4
            })
        );

        expect(getCurrentUserEvents).toHaveBeenCalledWith(
            expect.not.objectContaining({
                unknownField: "should-not-be-sent"
            })
        );
    });

    it("removes empty filter params before fetching current user events", async () => {
        getCurrentUserEvents.mockResolvedValue(createPaginatedMyEventResponse());

        const { result } = renderUseMyEventListingData();

        await act(async () => {
            await result.current.loadData(
                createMyEventFilters({
                    search: "",
                    type: "",
                    theme: "",
                    location: "",
                    date: "",
                    startDate: "",
                    endDate: ""
                }),
                1,
                "created"
            );
        });

        expect(getCurrentUserEvents).toHaveBeenCalledWith(
            expect.not.objectContaining({
                search: "",
                type: "",
                theme: "",
                location: "",
                date: "",
                startDate: "",
                endDate: ""
            })
        );

        expect(getCurrentUserEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                view: "created",
                page: 1,
                pageSize: 4
            })
        );
    });

    it("uses view default sorting when filters do not provide sort values", async () => {
        getCurrentUserEvents.mockResolvedValue(createPaginatedMyEventResponse());

        const { result } = renderUseMyEventListingData();

        await act(async () => {
            await result.current.loadData(
                createMyEventFilters({
                    sortBy: "",
                    order: ""
                }),
                1,
                "created"
            );
        });

        expect(getCurrentUserEvents).toHaveBeenCalledWith(
            expect.objectContaining({
                sortBy: expect.any(String),
                order: expect.any(String)
            })
        );
    });

    /* =============================
       LIKE STATE UPDATE
    ============================= */

    it("updates one current user event like state after like change", async () => {
        getCurrentUserEvents.mockResolvedValue(
            createPaginatedMyEventResponse({
                events: [
                    {
                        id: 1,
                        title: "Created event",
                        role: EVENT_ROLES.ORGANIZER,
                        likesCount: 2,
                        isLikedByCurrentUser: false
                    },
                    {
                        id: 2,
                        title: "Joined event",
                        role: EVENT_ROLES.PARTICIPANT,
                        likesCount: 5,
                        isLikedByCurrentUser: false
                    }
                ]
            })
        );

        const { result } = renderUseMyEventListingData();

        await act(async () => {
            await result.current.loadData(createMyEventFilters(), 1, "created");
        });

        act(() => {
            result.current.handleEventLikeChange({
                eventId: 1,
                liked: true,
                likesCount: 3
            });
        });

        expect(result.current.events).toEqual([
            expect.objectContaining({
                id: 1,
                likesCount: 3,
                isLikedByCurrentUser: true
            }),
            expect.objectContaining({
                id: 2,
                likesCount: 5,
                isLikedByCurrentUser: false
            })
        ]);
    });

    it("does not update current user events when like event id does not match", async () => {
        getCurrentUserEvents.mockResolvedValue(
            createPaginatedMyEventResponse({
                events: [
                    {
                        id: 1,
                        title: "Created event",
                        role: EVENT_ROLES.ORGANIZER,
                        likesCount: 2,
                        isLikedByCurrentUser: false
                    }
                ]
            })
        );

        const { result } = renderUseMyEventListingData();

        await act(async () => {
            await result.current.loadData(createMyEventFilters(), 1, "created");
        });

        act(() => {
            result.current.handleEventLikeChange({
                eventId: 999,
                liked: true,
                likesCount: 10
            });
        });

        expect(result.current.events).toEqual([
            expect.objectContaining({
                id: 1,
                likesCount: 2,
                isLikedByCurrentUser: false
            })
        ]);
    });

    /* =============================
       ROLE RESOLUTION
    ============================= */

    it("resolves current user's role for an event", async () => {
        getCurrentUserEvents.mockResolvedValue(
            createPaginatedMyEventResponse({
                events: [
                    {
                        id: 1,
                        title: "Joined event",
                        role: EVENT_ROLES.PARTICIPANT
                    }
                ]
            })
        );

        const { result } = renderUseMyEventListingData();

        await act(async () => {
            await result.current.loadData(createMyEventFilters(), 1, "joined");
        });

        expect(result.current.getCurrentUserRoleByEvent(1)).toBe(EVENT_ROLES.PARTICIPANT);
    });

    it("returns null when event id is unknown", async () => {
        getCurrentUserEvents.mockResolvedValue(
            createPaginatedMyEventResponse({
                events: [
                    {
                        id: 1,
                        title: "Known event",
                        role: EVENT_ROLES.PARTICIPANT
                    }
                ]
            })
        );

        const { result } = renderUseMyEventListingData();

        await act(async () => {
            await result.current.loadData(createMyEventFilters(), 1, "joined");
        });

        expect(result.current.getCurrentUserRoleByEvent(999)).toBeNull();
    });

    /* =============================
       ERROR HANDLING
    ============================= */

    it("sets an error message when loading current user events fails", async () => {
        getCurrentUserEvents.mockRejectedValue({});

        const { result } = renderUseMyEventListingData();

        await act(async () => {
            await result.current.loadData(createMyEventFilters(), 1, "created");
        });

        expect(setError).toHaveBeenCalledWith("Failed to load your events");
        expect(setLoading).toHaveBeenCalledWith(false);
        expect(setInitialLoading).toHaveBeenCalledWith(false);
    });
});
