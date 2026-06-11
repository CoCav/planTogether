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
   - error handling

   Notes:
   - mocks event API requests
   - mocks membership role hook
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
                user: options.user ?? user,
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

        expect(mockLoadMembershipRoles).toHaveBeenCalledTimes(1);
    });

    it("passes current user and events to membership role hook", () => {
        createHook();

        expect(useEventMembershipRoles).toHaveBeenCalledWith({
            user,
            events: []
        });
    });

    /* =============================
       ERROR HANDLING
    ============================= */

    it("sets an error message when loading events fails", async () => {
        getAllEvents.mockRejectedValue(new Error("Network error"));

        const { result } = createHook();

        await act(async () => {
            await result.current.loadData();
        });

        expect(setError).toHaveBeenCalledWith("Failed to load events");
        expect(result.current.isLoading).toBe(false);
    });
});
