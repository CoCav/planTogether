import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useMembershipActions from "../../../../features/eventMemberships/hooks/useMembershipActions";

import { joinEvent, leaveEvent } from "../../../../api/eventMemberships/eventMembershipApi";

import { EVENT_ROLES } from "../../../../features/shared/eventRoles";

/* ==================================================
   USE MEMBERSHIP ACTIONS TESTS
   Tests current user membership actions

   Handles:
   - joining events
   - leaving events
   - organizer leave protection
   - leave confirmation
   - co-organizer leave warning
   - API error handling
================================================== */

vi.mock("../../../../api/eventMemberships/eventMembershipApi", () => ({
    joinEvent: vi.fn(),
    leaveEvent: vi.fn()
}));

describe("useMembershipActions", () => {
    let loadData;
    let setMessage;
    let setError;
    let getRoleByEventId;

    beforeEach(() => {
        vi.clearAllMocks();

        loadData = vi.fn();
        setMessage = vi.fn();
        setError = vi.fn();
        getRoleByEventId = vi.fn();

        vi.spyOn(window, "confirm").mockReturnValue(true);
    });

    /* =============================
       TEST HELPERS
    ============================= */

    const setupHook = () => {
        return renderHook(() =>
            useMembershipActions({
                loadData,
                setMessage,
                setError,
                getRoleByEventId
            })
        );
    };

    /* =============================
       JOIN EVENT
    ============================= */

    it("should join an event successfully", async () => {
        joinEvent.mockResolvedValue();

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleJoinEvent(1);
        });

        expect(setError).toHaveBeenCalledWith("");
        expect(setMessage).toHaveBeenCalledWith("");

        expect(joinEvent).toHaveBeenCalledWith(1);
        expect(setMessage).toHaveBeenCalledWith("✅ Successfully joined event!");
        expect(loadData).toHaveBeenCalled();
    });

    it("should handle join event errors", async () => {
        joinEvent.mockRejectedValue(new Error("Request failed"));

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleJoinEvent(1);
        });

        expect(setError).toHaveBeenCalledWith("Request failed");
    });

    /* =============================
       LEAVE EVENT
    ============================= */

    it("should prevent organizer from leaving event", async () => {
        getRoleByEventId.mockReturnValue(EVENT_ROLES.ORGANIZER);

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(leaveEvent).not.toHaveBeenCalled();
        expect(window.confirm).not.toHaveBeenCalled();

        expect(setError).toHaveBeenCalledWith(
            "❌ Organizer cannot leave their own event"
        );
    });

    it("should leave event successfully for participant when confirmed", async () => {
        getRoleByEventId.mockReturnValue(EVENT_ROLES.PARTICIPANT);
        leaveEvent.mockResolvedValue();

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(window.confirm).toHaveBeenCalledWith(
            "Are you sure you want to leave this event?"
        );

        expect(setError).toHaveBeenCalledWith("");
        expect(setMessage).toHaveBeenCalledWith("");

        expect(leaveEvent).toHaveBeenCalledWith(1);
        expect(setMessage).toHaveBeenCalledWith("👋 Successfully left event");
        expect(loadData).toHaveBeenCalled();
    });

    it("should show co-organizer warning before leaving", async () => {
        getRoleByEventId.mockReturnValue(EVENT_ROLES.CO_ORGANIZER);
        leaveEvent.mockResolvedValue();

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(window.confirm).toHaveBeenCalledWith(
            "Are you sure you want to leave this event? You will lose your co-organizer role and will rejoin later as a participant."
        );

        expect(leaveEvent).toHaveBeenCalledWith(1);
    });

    it("should not leave event when user cancels confirmation", async () => {
        window.confirm.mockReturnValue(false);

        getRoleByEventId.mockReturnValue(EVENT_ROLES.PARTICIPANT);

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(leaveEvent).not.toHaveBeenCalled();
        expect(loadData).not.toHaveBeenCalled();
    });

    it("should handle leave event errors", async () => {
        getRoleByEventId.mockReturnValue(EVENT_ROLES.PARTICIPANT);
        leaveEvent.mockRejectedValue(new Error("Request failed"));

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(setError).toHaveBeenCalledWith("Request failed");
    });
});
