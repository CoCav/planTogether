import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useMembershipManagement from "../../../../features/eventMemberships/hooks/useMembershipManagement";

import { removeEventMember, transferEventOwnership, updateEventMemberRole } from "../../../../api/eventMemberships/eventMembershipApi";

import { EVENT_ROLES } from "../../../../features/shared/constants/eventRoles";

import { createMutationHookProps } from "../../../helpers/hooks/createHookProps";
import { mockConfirmAccepted } from "../../../helpers/mocks/mockWindowConfirm";

/* ==================================================
   USE MEMBERSHIP MANAGEMENT TESTS
   Tests organizer membership management actions

   Handles:
   - member promotion
   - member demotion
   - member removal
   - ownership transfer
   - confirmation cancellation
   - API error handling

   Notes:
   - uses reusable mutation hook prop helpers
   - uses reusable confirmation dialog mock helpers
================================================== */

vi.mock("../../../../api/eventMemberships/eventMembershipApi", () => ({
    removeEventMember: vi.fn(),
    transferEventOwnership: vi.fn(),
    updateEventMemberRole: vi.fn()
}));

describe("useMembershipManagement", () => {

    let hookProps;

    beforeEach(() => {
        vi.clearAllMocks();

        hookProps = createMutationHookProps({
            eventId: 1
        });

        mockConfirmAccepted();
    });

    /* =============================
       TEST HELPERS
    ============================= */

    // Render membership management hook
    const setupHook = () => {
        return renderHook(() =>
            useMembershipManagement(hookProps)
        );
    };

    /* =============================
       ROLE MANAGEMENT
    ============================= */

    it("should promote a participant to co-organizer", async () => {
        updateEventMemberRole.mockResolvedValue();

        const { result } = setupHook();

        await act(async () => {
            await result.current.handlePromoteMember(2);
        });

        expect(hookProps.setMessage).toHaveBeenCalledWith("");

        expect(hookProps.setError).toHaveBeenCalledWith("");

        expect(updateEventMemberRole).toHaveBeenCalledWith(1, 2, EVENT_ROLES.CO_ORGANIZER);

        expect(hookProps.setMessage).toHaveBeenCalledWith("User promoted to co-organizer");

        expect(hookProps.loadData).toHaveBeenCalled();
    });

    it("should handle promote errors", async () => {
        updateEventMemberRole.mockRejectedValue(
            new Error("Request failed")
        );

        const { result } = setupHook();

        await act(async () => {
            await result.current.handlePromoteMember(2);
        });

        expect(hookProps.setError).toHaveBeenCalledWith("Request failed");
    });

    it("should demote a co-organizer to participant", async () => {
        updateEventMemberRole.mockResolvedValue();

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleDemoteMember(2);
        });

        expect(updateEventMemberRole).toHaveBeenCalledWith(1, 2, EVENT_ROLES.PARTICIPANT);

        expect(hookProps.setMessage).toHaveBeenCalledWith("User demoted to participant");

        expect(hookProps.loadData).toHaveBeenCalled();
    });

    it("should handle demote errors", async () => {
        updateEventMemberRole.mockRejectedValue(
            new Error("Request failed")
        );

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleDemoteMember(2);
        });

        expect(hookProps.setError).toHaveBeenCalledWith("Request failed");
    });

    /* =============================
       MEMBER REMOVAL
    ============================= */

    it("should remove a member when user confirms", async () => {
        removeEventMember.mockResolvedValue();

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleRemoveMember(2);
        });

        expect(window.confirm).toHaveBeenCalledWith(
            "Are you sure you want to remove this member from the event?"
        );

        expect(removeEventMember).toHaveBeenCalledWith(1, 2);

        expect(hookProps.setMessage).toHaveBeenCalledWith("Member removed successfully");

        expect(hookProps.loadData).toHaveBeenCalled();
    });

    it("should not remove member when user cancels", async () => {
        window.confirm.mockReturnValue(false);

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleRemoveMember(2);
        });

        expect(removeEventMember).not.toHaveBeenCalled();

        expect(hookProps.loadData).not.toHaveBeenCalled();
    });

    it("should handle remove member errors", async () => {
        removeEventMember.mockRejectedValue(
            new Error("Request failed")
        );

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleRemoveMember(2);
        });

        expect(hookProps.setError).toHaveBeenCalledWith("Request failed");
    });

    /* =============================
       OWNERSHIP TRANSFER
    ============================= */

    it("should transfer event ownership when user confirms", async () => {
        transferEventOwnership.mockResolvedValue();

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleTransferOwnership(2);
        });

        expect(window.confirm).toHaveBeenCalledWith(
            "Are you sure you want to transfer ownership of this event?"
        );

        expect(transferEventOwnership).toHaveBeenCalledWith(1, 2);

        expect(hookProps.setMessage).toHaveBeenCalledWith("Event ownership transferred successfully");

        expect(hookProps.loadData).toHaveBeenCalled();
    });

    it("should not transfer ownership when user cancels", async () => {
        window.confirm.mockReturnValue(false);

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleTransferOwnership(2);
        });

        expect(transferEventOwnership).not.toHaveBeenCalled();

        expect(hookProps.loadData).not.toHaveBeenCalled();
    });

    it("should handle transfer ownership errors", async () => {
        transferEventOwnership.mockRejectedValue(
            new Error("Request failed")
        );

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleTransferOwnership(2);
        });

        expect(hookProps.setError).toHaveBeenCalledWith("Request failed");
    });
});
