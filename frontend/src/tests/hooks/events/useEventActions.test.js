import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { joinEvent, leaveEvent } from "../../../api/eventMembershipApi";
import useEventActions from "../../../hooks/events/useEventActions";

/* ==================================================
   USE EVENT ACTIONS TESTS
   Tests basic event join / leave actions
================================================== */

vi.mock("../../../api/eventMembershipApi", () => ({
    joinEvent: vi.fn(),
    leaveEvent: vi.fn()
}));

describe("useEventActions", () => {
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
    });

    const setupHook = () => renderHook(() => useEventActions({ loadData, setMessage, setError, getRoleByEventId }));

    it("joins event successfully", async () => {
        joinEvent.mockResolvedValue();

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleJoinEvent(1);
        });

        expect(joinEvent).toHaveBeenCalledWith(1);
        expect(setMessage).toHaveBeenCalledWith("✅ Successfully joined event!");
        expect(loadData).toHaveBeenCalled();
    });

    it("handles join event error", async () => {
        joinEvent.mockRejectedValue(new Error("fail"));

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleJoinEvent(1);
        });

        expect(setError).toHaveBeenCalledWith("❌ Unable to join event");
    });

    it("prevents organizer from leaving event", async () => {
        getRoleByEventId.mockReturnValue("organizer");

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(leaveEvent).not.toHaveBeenCalled();
        expect(setError).toHaveBeenCalledWith("❌ Organizer cannot leave their own event");
    });

    it("leaves event successfully for participant", async () => {
        getRoleByEventId.mockReturnValue("participant");
        leaveEvent.mockResolvedValue();

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(leaveEvent).toHaveBeenCalledWith(1);
        expect(setMessage).toHaveBeenCalledWith("👋 Successfully left event");
        expect(loadData).toHaveBeenCalled();
    });

    it("handles leave event error", async () => {
        getRoleByEventId.mockReturnValue("participant");
        leaveEvent.mockRejectedValue(new Error("fail"));

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(setError).toHaveBeenCalledWith("❌ Unable to leave event");
    });
});
