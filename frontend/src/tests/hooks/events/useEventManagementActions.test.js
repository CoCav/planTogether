import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteEvent } from "../../../api/eventApi";
import { removeEventMember, updateMemberRole } from "../../../api/eventMembershipApi";
import useEventManagementActions from "../../../hooks/events/useEventManagementActions";

/* ==================================================
   USE EVENT MANAGEMENT ACTIONS TESTS
   Tests organizer event management actions
================================================== */

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate
}));

vi.mock("../../../api/eventApi", () => ({
    deleteEvent: vi.fn()
}));

vi.mock("../../../api/eventMembershipApi", () => ({
    updateMemberRole: vi.fn(),
    removeEventMember: vi.fn()
}));

describe("useEventManagementActions", () => {
    let loadData;
    let setMessage;
    let setError;

    beforeEach(() => {
        vi.clearAllMocks();

        loadData = vi.fn();
        setMessage = vi.fn();
        setError = vi.fn();
    });

    const setupHook = () => renderHook(() => useEventManagementActions({ eventId: 1, loadData, setMessage, setError }));

    it("promotes a participant to co-organizer", async () => {
        updateMemberRole.mockResolvedValue();

        const { result } = setupHook();

        await act(async () => {
            await result.current.handlePromote(2);
        });

        expect(updateMemberRole).toHaveBeenCalledWith(1, 2, "co_organizer");
        expect(setMessage).toHaveBeenCalledWith("✅ User promoted to co-organizer");
        expect(loadData).toHaveBeenCalled();
    });

    it("handles promote errors", async () => {
        updateMemberRole.mockRejectedValue(new Error("fail"));

        const { result } = setupHook();

        await act(async () => {
            await result.current.handlePromote(2);
        });

        expect(setError).toHaveBeenCalledWith("❌ Unable to promote user");
    });

    it("demotes a co-organizer to participant", async () => {
        updateMemberRole.mockResolvedValue();

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleDemote(2);
        });

        expect(updateMemberRole).toHaveBeenCalledWith(1, 2, "participant");
        expect(setMessage).toHaveBeenCalledWith("⬇️ User demoted to participant");
        expect(loadData).toHaveBeenCalled();
    });

    it("handles demote errors", async () => {
        updateMemberRole.mockRejectedValue(new Error("fail"));

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleDemote(2);
        });

        expect(setError).toHaveBeenCalledWith("❌ Unable to demote user");
    });

    it("removes a member when user confirms", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(true);
        removeEventMember.mockResolvedValue();

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleRemoveMember(2);
        });

        expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to remove this member from the event?");
        expect(removeEventMember).toHaveBeenCalledWith(1, 2);
        expect(setMessage).toHaveBeenCalledWith("🗑️ Member removed successfully");
        expect(loadData).toHaveBeenCalled();
    });

    it("does not remove member when user cancels", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(false);

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleRemoveMember(2);
        });

        expect(removeEventMember).not.toHaveBeenCalled();
    });

    it("handles remove member errors", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(true);
        removeEventMember.mockRejectedValue(new Error("fail"));

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleRemoveMember(2);
        });

        expect(setError).toHaveBeenCalledWith("❌ Unable to remove member");
    });

    it("deletes event and redirects when user confirms", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(true);
        deleteEvent.mockResolvedValue();

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleDeleteEvent();
        });

        expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to delete this event?");
        expect(deleteEvent).toHaveBeenCalledWith(1);
        expect(mockNavigate).toHaveBeenCalledWith("/events");
    });

    it("does not delete event when user cancels", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(false);

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleDeleteEvent();
        });

        expect(deleteEvent).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("handles delete event errors", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(true);
        deleteEvent.mockRejectedValue(new Error("fail"));

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleDeleteEvent();
        });

        expect(setError).toHaveBeenCalledWith("❌ Unable to delete event");
    });
});
