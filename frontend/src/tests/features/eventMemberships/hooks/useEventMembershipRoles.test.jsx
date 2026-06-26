import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useEventMembershipRoles from "../../../../features/eventMemberships/hooks/useEventMembershipRoles";

import { fetchAllPaginated } from "../../../../utils/pagination";

import { EVENT_ROLES } from "../../../../features/shared/constants/eventRoles";

/* ==================================================
   USE EVENT MEMBERSHIP ROLES TESTS
   Tests current user event membership role loading

   Handles:
   - initial membership role state
   - unauthenticated user fallback
   - created and joined membership role loading
   - duplicate membership fetch prevention
   - forced membership reload
   - current user organizer role resolution
   - current user membership role resolution
   - missing role fallback
================================================== */

vi.mock("../../../../api/users/userApi", () => ({
    getCurrentUserEvents: vi.fn()
}));

vi.mock("../../../../utils/pagination", () => ({
    fetchAllPaginated: vi.fn()
}));

describe("useEventMembershipRoles", () => {

    /* =============================
       TEST DATA
    ============================= */

    const user = {
        userId: 1
    };

    const events = [
        {
            id: 10,
            creatorId: 1
        },
        {
            id: 20,
            creatorId: 2
        },
        {
            id: 30,
            creatorId: 3
        }
    ];

    const membershipEvents = [
        {
            id: 20,
            role: EVENT_ROLES.PARTICIPANT
        }
    ];

    /* =============================
       TEST HELPERS
    ============================= */

    const createHook = (options = {}) => {
        return renderHook(() =>
            useEventMembershipRoles({
                user: Object.hasOwn(options, "user")
                    ? options.user
                    : user,

                events: options.events ?? events
            })
        );
    };
    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        fetchAllPaginated.mockResolvedValue(membershipEvents);
    });

    /* =============================
       INITIAL STATE
    ============================= */

    it("initializes membership role state", () => {
        const { result } = createHook();

        expect(result.current.membershipMap).toEqual({});
    });

    /* =============================
       MEMBERSHIP LOADING
    ============================= */

    it("loads current user created and joined membership roles", async () => {
        fetchAllPaginated
            .mockResolvedValueOnce([
                { id: 10, role: EVENT_ROLES.ORGANIZER }
            ])
            .mockResolvedValueOnce([
                { id: 20, role: EVENT_ROLES.PARTICIPANT }
            ]);

        const { result } = createHook();

        await act(async () => {
            await result.current.loadMembershipRoles();
        });

        expect(fetchAllPaginated).toHaveBeenCalledTimes(2);

        expect(fetchAllPaginated).toHaveBeenNthCalledWith(1, {
            fetchPage: expect.any(Function),
            getItems: expect.any(Function),
            pageSize: 10
        });

        expect(fetchAllPaginated).toHaveBeenNthCalledWith(2, {
            fetchPage: expect.any(Function),
            getItems: expect.any(Function),
            pageSize: 10
        });

        expect(result.current.membershipMap).toEqual({
            10: EVENT_ROLES.ORGANIZER,
            20: EVENT_ROLES.PARTICIPANT
        });
    });

    it("does not reload roles for the same user unless forced", async () => {
        const { result } = createHook();

        await act(async () => {
            await result.current.loadMembershipRoles();
        });

        await act(async () => {
            await result.current.loadMembershipRoles();
        });

        expect(fetchAllPaginated).toHaveBeenCalledTimes(2);
    });

    it("reloads roles for the same user when forced", async () => {
        const { result } = createHook();

        await act(async () => {
            await result.current.loadMembershipRoles();
        });

        await act(async () => {
            await result.current.loadMembershipRoles({ force: true });
        });

        expect(fetchAllPaginated).toHaveBeenCalledTimes(4);
    });

    it("clears membership role map when user is not authenticated", async () => {
        const { result } = createHook({
            user: null
        });

        act(() => {
            result.current.setMembershipMap({
                20: EVENT_ROLES.PARTICIPANT
            });
        });

        await act(async () => {
            await result.current.loadMembershipRoles();
        });

        expect(result.current.membershipMap).toEqual({});
        expect(fetchAllPaginated).not.toHaveBeenCalled();
    });

    /* =============================
       ROLE RESOLUTION
    ============================= */

    it("returns organizer role when current user created the event", () => {
        const { result } = createHook();

        expect(result.current.getCurrentUserRoleByEvent(10)).toBe(EVENT_ROLES.ORGANIZER);
    });

    it("returns membership role from loaded membership map", async () => {
        const { result } = createHook();

        await act(async () => {
            await result.current.loadMembershipRoles();
        });

        expect(result.current.getCurrentUserRoleByEvent(20)).toBe(EVENT_ROLES.PARTICIPANT);
    });

    it("returns null when user has no role for the event", () => {
        const { result } = createHook();

        expect(result.current.getCurrentUserRoleByEvent(30)).toBeNull();
    });

    it("returns null when event does not exist", () => {
        const { result } = createHook();

        expect(result.current.getCurrentUserRoleByEvent(999)).toBeNull();
    });

    it("returns null when user is not authenticated", () => {
        const { result } = createHook({
            user: null
        });

        expect(result.current.getCurrentUserRoleByEvent(10)).toBeNull();
    });
});
