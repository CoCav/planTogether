import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import useHomeEvents from "../../../../features/events/hooks/useHomeEvents";

import { getAllEvents } from "../../../../api/events/eventApi";

import useEventMembershipRoles from "../../../../features/eventMemberships/hooks/useEventMembershipRoles";

/* ==================================================
   USE HOME EVENTS TESTS
   Tests homepage latest event preview loading

   Handles:
   - initial home event state
   - latest event loading
   - homepage event query params
   - membership role loading integration
   - current user role lookup exposure
   - loading state updates
   - authenticated membership role refresh
   - unauthenticated membership role skip
   - local event like state update
   - error handling

   Notes:
   - mocks event API requests
   - mocks membership role hook
   - like mutation logic is tested in useEventLike
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

describe("useHomeEvents", () => {
    let setError;

    /* =============================
       TEST DATA
    ============================= */

    const user = {
        userId: 1
    };

    const createEventResponse = ({ events = [] } = {}) => ({
        events,
        success: true,
        message: "Events retrieved"
    });

    /* =============================
       TEST HELPERS
    ============================= */

    const createHook = (options = {}) => {
        return renderHook(() =>
            useHomeEvents({
                user: Object.hasOwn(options, "user")
                    ? options.user
                    : user,
                setError
            })
        );
    };

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        setError = vi.fn();

        useEventMembershipRoles.mockReturnValue({
            loadMembershipRoles: mockLoadMembershipRoles,
            getCurrentUserRoleByEvent: mockGetCurrentUserRoleByEvent
        });
    });

    /* =============================
       INITIAL STATE
    ============================= */

    it("initializes home event state", () => {
        const { result } = createHook();

        expect(result.current.events).toEqual([]);
        expect(result.current.isLoading).toBe(true);
        expect(result.current.getCurrentUserRoleByEvent)
            .toBe(mockGetCurrentUserRoleByEvent);
    });

    /* =============================
       EVENT LOADING
    ============================= */

    it("loads latest homepage events", async () => {
        getAllEvents.mockResolvedValue(
            createEventResponse({
                events: [
                    {
                        id: 1,
                        title: "React meetup",
                        creatorId: 10
                    }
                ]
            })
        );

        const { result } = createHook();

        await act(async () => {
            await result.current.loadData();
        });

        expect(getAllEvents).toHaveBeenCalledWith({
            page: 1,
            pageSize: 4,
            sortBy: "createdAt",
            order: "desc"
        });

        expect(result.current.events).toEqual([
            expect.objectContaining({
                id: 1,
                title: "React meetup",
                creatorId: 10
            })
        ]);
    });

    it("clears previous error before loading events", async () => {
        getAllEvents.mockResolvedValue(createEventResponse());

        const { result } = createHook();

        await act(async () => {
            await result.current.loadData();
        });

        expect(setError).toHaveBeenCalledWith("");
    });

    it("updates loading state after loading events", async () => {
        getAllEvents.mockResolvedValue(createEventResponse());

        const { result } = createHook();

        await act(async () => {
            await result.current.loadData();
        });

        expect(result.current.isLoading).toBe(false);
    });

    /* =============================
       MEMBERSHIP ROLES
    ============================= */

    it("loads membership roles after loading events", async () => {
        getAllEvents.mockResolvedValue(createEventResponse());

        const { result } = createHook();

        await act(async () => {
            await result.current.loadData();
        });

        expect(mockLoadMembershipRoles).toHaveBeenCalledWith({
            force: true
        });
    });

    it("passes current user and events to membership role hook", () => {
        createHook();

        expect(useEventMembershipRoles).toHaveBeenCalledWith({
            user,
            events: []
        });
    });

    it("does not load membership roles when user is not authenticated", async () => {
        getAllEvents.mockResolvedValue(createEventResponse());

        const { result } = createHook({
            user: null
        });

        await act(async () => {
            await result.current.loadData();
        });

        expect(mockLoadMembershipRoles).not.toHaveBeenCalled();
    });

    /* =============================
       LIKE STATE UPDATE
    ============================= */

    it("updates one home event like state after like change", async () => {
        getAllEvents.mockResolvedValue(
            createEventResponse({
                events: [
                    {
                        id: 1,
                        title: "React meetup",
                        likesCount: 2,
                        isLikedByCurrentUser: false
                    },
                    {
                        id: 2,
                        title: "Vue meetup",
                        likesCount: 5,
                        isLikedByCurrentUser: false
                    }
                ]
            })
        );

        const { result } = createHook();

        await act(async () => {
            await result.current.loadData();
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

    it("does not update home events when like event id does not match", async () => {
        getAllEvents.mockResolvedValue(
            createEventResponse({
                events: [
                    {
                        id: 1,
                        title: "React meetup",
                        likesCount: 2,
                        isLikedByCurrentUser: false
                    }
                ]
            })
        );

        const { result } = createHook();

        await act(async () => {
            await result.current.loadData();
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
       ERROR HANDLING
    ============================= */

    it("sets an error message when loading events fails", async () => {
        getAllEvents.mockRejectedValue({});

        const { result } = createHook();

        await act(async () => {
            await result.current.loadData();
        });

        expect(setError).toHaveBeenCalledWith("Failed to load events");
        expect(result.current.isLoading).toBe(false);
    });
});
