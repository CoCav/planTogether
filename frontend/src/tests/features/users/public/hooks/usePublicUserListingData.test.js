import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import usePublicUserListingData from "../../../../../features/users/public/hooks/usePublicUserListingData";

import { getPublicUserProfile, getPublicUserEvents } from "../../../../../api/users/userApi";

/* ==================================================
   USE PUBLIC USER LISTING DATA TESTS
   Tests public user profile and event listing data loading

   Handles:
   - initial public user profile loading
   - public event listing loading
   - total public event count derivation
   - empty filter cleanup before API requests
   - public user payload normalization
   - paginated event payload normalization
   - pagination state updates
   - event-only refresh behavior
   - loading and error callbacks
================================================== */

vi.mock("../../../../../api/users/userApi", () => ({
    getPublicUserProfile: vi.fn(),
    getPublicUserEvents: vi.fn()
}));

describe("usePublicUserListingData", () => {

    /* =============================
       TEST DATA
    ============================= */

    const publicProfileResponse = {
        user: {
            name: "Sakura",
            avatar: "/uploads/avatars/avatar.png"
        },
        stats: {
            createdEventsCount: 2,
            joinedEventsCount: 1
        },
        success: true,
        message: "Public user profile retrieved successfully"
    };

    const publicEventsResponse = {
        view: "created",
        page: 1,
        pageSize: 4,
        totalEvents: 2,
        totalPages: 1,
        events: [
            {
                id: 1,
                title: "Created event"
            },
            {
                id: 2,
                title: "Another created event"
            }
        ],
        success: true,
        message: "Public user events retrieved successfully"
    };

    const defaultOptions = {
        userId: 42,
        filters: {
            search: "",
            status: "",
            mode: "",
            theme: "React"
        },
        activeView: "created",
        viewContent: {
            defaultSortBy: "startDateTime",
            defaultOrder: "asc"
        },
        pagination: {
            page: 1,
            pageSize: 4,
            totalPages: 1,
            totalEvents: 0
        },
        setPagination: vi.fn(),
        setInitialLoading: vi.fn(),
        setIsLoading: vi.fn(),
        setError: vi.fn()
    };

    const renderUsePublicUserListingData = (options = {}) => {
        return renderHook(() =>
            usePublicUserListingData({
                ...defaultOptions,
                ...options
            })
        );
    };

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        getPublicUserProfile.mockResolvedValue(publicProfileResponse);
        getPublicUserEvents.mockResolvedValue(publicEventsResponse);
    });

    /* =============================
       INITIAL STATE
    ============================= */

    it("should expose default public user listing data state", () => {
        const { result } = renderUsePublicUserListingData();

        expect(result.current.profile).toEqual({
            user: {
                name: "",
                avatar: null
            },
            stats: {
                createdEventsCount: 0,
                joinedEventsCount: 0
            }
        });

        expect(result.current.events).toEqual([]);
        expect(result.current.totalPublicEvents).toBe(0);
    });

    /* =============================
       INITIAL DATA LOADING
    ============================= */

    it("should load public user profile and paginated events", async () => {
        const { result } = renderUsePublicUserListingData();

        await act(async () => {
            await result.current.loadInitialData();
        });

        expect(getPublicUserProfile).toHaveBeenCalledWith(42);

        expect(getPublicUserEvents).toHaveBeenCalledWith(42, {
            theme: "React",
            view: "created",
            page: 1,
            pageSize: 4,
            sortBy: "startDateTime",
            order: "asc"
        });

        expect(result.current.profile).toEqual({
            user: {
                name: "Sakura",
                avatar: "/uploads/avatars/avatar.png"
            },
            stats: {
                createdEventsCount: 2,
                joinedEventsCount: 1
            },
            message: "Public user profile retrieved successfully",
            success: true
        });

        expect(result.current.totalPublicEvents).toBe(3);

        expect(result.current.events).toEqual([
            expect.objectContaining({
                id: 1,
                title: "Created event"
            }),
            expect.objectContaining({
                id: 2,
                title: "Another created event"
            })
        ]);

        expect(defaultOptions.setPagination).toHaveBeenCalled();
        expect(defaultOptions.setIsLoading).toHaveBeenCalledWith(false);
        expect(defaultOptions.setInitialLoading).toHaveBeenCalledWith(false);
    });

    it("should update pagination metadata after loading events", async () => {
        const { result } = renderUsePublicUserListingData();

        await act(async () => {
            await result.current.loadInitialData();
        });

        const paginationUpdater = defaultOptions.setPagination.mock.calls[0][0];

        expect(
            paginationUpdater({
                pageSize: 4
            })
        ).toEqual({
            pageSize: 4,
            page: 1,
            totalEvents: 2,
            totalPages: 1
        });
    });

    it("should support load overrides for filters, page and view", async () => {
        const { result } = renderUsePublicUserListingData();

        await act(async () => {
            await result.current.loadInitialData({
                filters: {
                    search: "party",
                    status: "",
                    mode: ""
                },
                page: 2,
                view: "joined"
            });
        });

        expect(getPublicUserEvents).toHaveBeenCalledWith(42, {
            search: "party",
            view: "joined",
            page: 2,
            pageSize: 4,
            sortBy: "startDateTime",
            order: "asc"
        });
    });

    /* =============================
       EVENT REFRESH
    ============================= */

    it("should refresh events without reloading the profile", async () => {
        const { result } = renderUsePublicUserListingData();

        await act(async () => {
            await result.current.refreshEvents({
                filters: {
                    theme: "Music"
                },
                page: 3,
                view: "joined"
            });
        });

        expect(getPublicUserProfile).not.toHaveBeenCalled();

        expect(getPublicUserEvents).toHaveBeenCalledWith(42, {
            theme: "Music",
            view: "joined",
            page: 3,
            pageSize: 4,
            sortBy: "startDateTime",
            order: "asc"
        });
    });

    it("should expose empty events when public event payload is empty", async () => {
        getPublicUserEvents.mockResolvedValue({
            view: "created",
            page: 1,
            pageSize: 4,
            totalEvents: 0,
            totalPages: 0,
            events: [],
            success: true,
            message: "Public user events retrieved successfully"
        });

        const { result } = renderUsePublicUserListingData();

        await act(async () => {
            await result.current.refreshEvents();
        });

        expect(result.current.events).toEqual([]);
    });

    /* =============================
       ERROR HANDLING
    ============================= */

    it("should set profile error when initial loading fails", async () => {
        getPublicUserProfile.mockRejectedValue(new Error("Network error"));

        const { result } = renderUsePublicUserListingData();

        await act(async () => {
            await result.current.loadInitialData();
        });

        expect(defaultOptions.setError).toHaveBeenCalledWith("❌ Failed to load public user profile");

        expect(defaultOptions.setIsLoading).toHaveBeenCalledWith(false);
        expect(defaultOptions.setInitialLoading).toHaveBeenCalledWith(false);
    });

    it("should set event error when event refresh fails", async () => {
        getPublicUserEvents.mockRejectedValue(new Error("Network error"));

        const { result } = renderUsePublicUserListingData();

        await act(async () => {
            await result.current.refreshEvents();
        });

        expect(defaultOptions.setError).toHaveBeenCalledWith("❌ Failed to load public user events");

        expect(defaultOptions.setIsLoading).toHaveBeenCalledWith(false);
    });
});
