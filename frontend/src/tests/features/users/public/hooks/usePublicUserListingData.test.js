import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import usePublicUserListingData from "../../../../../features/users/public/hooks/usePublicUserListingData";

import { getPublicUserProfile, getPublicUserEvents } from "../../../../../api/users/userApi";

/* ==================================================
   USE PUBLIC USER LISTING DATA TESTS
   Tests public user profile and event listing data loading

   Handles:
   - public user profile loading
   - public created/joined event loading
   - public payload normalization
   - active event view state
   - visible event resolution
   - loading and error states
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
        createdEvents: [
            {
                id: 1,
                title: "Created event"
            },
            {
                id: 2,
                title: "Another created event"
            }
        ],
        joinedEvents: [
            {
                id: 3,
                title: "Joined event"
            }
        ],
        success: true,
        message: "Public user events retrieved successfully"
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

    it("should expose default public user listing state", () => {
        const { result } = renderHook(() =>
            usePublicUserListingData(1)
        );

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

        expect(result.current.events).toEqual({
            createdEvents: [],
            joinedEvents: []
        });

        expect(result.current.visibleEvents).toEqual([]);
        expect(result.current.activeView).toBe("created");
        expect(result.current.initialLoading).toBe(true);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe("");
    });

    /* =============================
       PUBLIC USER DATA LOADING
    ============================= */

    it("should load public user profile and events", async () => {
        const { result } = renderHook(() =>
            usePublicUserListingData(42)
        );

        await act(async () => {
            await result.current.loadData();
        });

        expect(getPublicUserProfile).toHaveBeenCalledWith(42);
        expect(getPublicUserEvents).toHaveBeenCalledWith(42);

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

        expect(result.current.events.createdEvents).toEqual([
            expect.objectContaining({
                id: 1,
                title: "Created event"
            }),
            expect.objectContaining({
                id: 2,
                title: "Another created event"
            })
        ]);

        expect(result.current.events.joinedEvents).toEqual([
            expect.objectContaining({
                id: 3,
                title: "Joined event"
            })
        ]);

        expect(result.current.visibleEvents).toHaveLength(2);
        expect(result.current.initialLoading).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe("");
    });

    it("should show joined events when active view is joined", async () => {
        const { result } = renderHook(() =>
            usePublicUserListingData(42)
        );

        await act(async () => {
            await result.current.loadData();
        });

        act(() => {
            result.current.setActiveView("joined");
        });

        expect(result.current.activeView).toBe("joined");
        expect(result.current.viewContent.key).toBe("joined");

        expect(result.current.visibleEvents).toEqual([
            expect.objectContaining({
                id: 3,
                title: "Joined event"
            })
        ]);
    });

    it("should show created events by default", async () => {
        const { result } = renderHook(() =>
            usePublicUserListingData(42)
        );

        await act(async () => {
            await result.current.loadData();
        });

        expect(result.current.activeView).toBe("created");
        expect(result.current.viewContent.key).toBe("created");

        expect(result.current.visibleEvents).toEqual([
            expect.objectContaining({
                id: 1,
                title: "Created event"
            }),
            expect.objectContaining({
                id: 2,
                title: "Another created event"
            })
        ]);
    });

    it("should expose empty visible events when public event payload is empty", async () => {
        getPublicUserEvents.mockResolvedValue({
            createdEvents: [],
            joinedEvents: [],
            success: true,
            message: "Public user events retrieved successfully"
        });

        const { result } = renderHook(() =>
            usePublicUserListingData(42)
        );

        await act(async () => {
            await result.current.loadData();
        });

        expect(result.current.visibleEvents).toEqual([]);
    });

    /* =============================
       ERROR HANDLING
    ============================= */

    it("should set an error message when loading public user data fails", async () => {
        getPublicUserProfile.mockRejectedValue(new Error("Network error"));

        const { result } = renderHook(() =>
            usePublicUserListingData(42)
        );

        await act(async () => {
            await result.current.loadData();
        });

        expect(result.current.error).toBe("❌ Failed to load public user profile");
        expect(result.current.initialLoading).toBe(false);
        expect(result.current.isLoading).toBe(false);
    });
});
