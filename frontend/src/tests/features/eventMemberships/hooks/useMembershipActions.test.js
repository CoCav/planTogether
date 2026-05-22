import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useMembershipActions from "../../../../features/eventMemberships/hooks/useMembershipActions";

import { joinEvent, leaveEvent } from "../../../../api/eventMemberships/eventMembershipApi";

import { EVENT_ROLES } from "../../../../features/shared/constants/eventRoles";

import { createMembershipActionHookProps } from "../../../helpers/hooks/createHookProps";
import { mockConfirmAccepted } from "../../../helpers/mocks/mockWindowConfirm";

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

   Notes:
   - uses reusable membership hook prop helpers
   - uses reusable confirmation dialog mock helpers
================================================== */

vi.mock("../../../../api/eventMemberships/eventMembershipApi", () => ({
    joinEvent: vi.fn(),
    leaveEvent: vi.fn()
}));

describe("useMembershipActions", () => {

    let hookProps;

    beforeEach(() => {
        vi.clearAllMocks();

        hookProps = createMembershipActionHookProps();

        mockConfirmAccepted();
    });

    /* =============================
       TEST HELPERS
    ============================= */

    // Render membership actions hook
    const setupHook = () => {
        return renderHook(() =>
            useMembershipActions(hookProps)
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

        expect(hookProps.setError).toHaveBeenCalledWith("");
        expect(hookProps.setMessage).toHaveBeenCalledWith("");

        expect(joinEvent).toHaveBeenCalledWith(1);

        expect(hookProps.setMessage).toHaveBeenCalledWith("✅ Successfully joined event!");

        expect(hookProps.loadData).toHaveBeenCalled();
    });

    it("should handle join event errors", async () => {
        joinEvent.mockRejectedValue(
            new Error("Request failed")
        );

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleJoinEvent(1);
        });

        expect(hookProps.setError).toHaveBeenCalledWith("Request failed");
    });

    /* =============================
       LEAVE EVENT
    ============================= */

    it("should prevent organizer from leaving event", async () => {
        hookProps.getCurrentUserRoleByEvent.mockReturnValue(EVENT_ROLES.ORGANIZER);

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(leaveEvent).not.toHaveBeenCalled();

        expect(window.confirm).not.toHaveBeenCalled();

        expect(hookProps.setError).toHaveBeenCalledWith("❌ Organizer cannot leave their own event");
    });

    it("should use direct current user role when provided", async () => {
        hookProps.currentUserRole = EVENT_ROLES.ORGANIZER;

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(hookProps.getCurrentUserRoleByEvent).not.toHaveBeenCalled();
        expect(leaveEvent).not.toHaveBeenCalled();
        expect(hookProps.setError).toHaveBeenCalledWith(
            "❌ Organizer cannot leave their own event"
        );
    });

    it("should leave event successfully for participant when confirmed", async () => {
        hookProps.getCurrentUserRoleByEvent.mockReturnValue(EVENT_ROLES.PARTICIPANT);

        leaveEvent.mockResolvedValue();

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to leave this event?");

        expect(hookProps.setError).toHaveBeenCalledWith("");

        expect(hookProps.setMessage).toHaveBeenCalledWith("");

        expect(leaveEvent).toHaveBeenCalledWith(1);

        expect(hookProps.setMessage).toHaveBeenCalledWith("👋 Successfully left event");

        expect(hookProps.loadData).toHaveBeenCalled();
    });

    it("should show co-organizer warning before leaving", async () => {
        hookProps.getCurrentUserRoleByEvent.mockReturnValue(EVENT_ROLES.CO_ORGANIZER);

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

        hookProps.getCurrentUserRoleByEvent.mockReturnValue(EVENT_ROLES.PARTICIPANT);

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(leaveEvent).not.toHaveBeenCalled();

        expect(hookProps.loadData).not.toHaveBeenCalled();
    });

    it("should handle leave event errors", async () => {
        hookProps.getCurrentUserRoleByEvent.mockReturnValue(EVENT_ROLES.PARTICIPANT);

        leaveEvent.mockRejectedValue(
            new Error("Request failed")
        );

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(hookProps.setError).toHaveBeenCalledWith("Request failed");
    });
});
