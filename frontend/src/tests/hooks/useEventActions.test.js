import { describe, it, expect, vi, beforeEach } from "vitest";
import useEventActions from "../../hooks/useEventActions";
import * as api from "../../api/eventMembershipApi";

// Mock API
vi.mock("../../api/eventMembershipApi", () => ({
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

    it("should join event successfully", async () => {
        api.joinEvent.mockResolvedValue();

        const { handleJoinEvent } = useEventActions({
            loadData,
            setMessage,
            setError,
            getRoleByEventId
        });

        await handleJoinEvent(1);

        expect(api.joinEvent).toHaveBeenCalledWith(1);
        expect(setMessage).toHaveBeenCalledWith("✅ Successfully Joined event !");
        expect(loadData).toHaveBeenCalled();
    });

    it("should handle join event error", async () => {
        api.joinEvent.mockRejectedValue(new Error("fail"));

        const { handleJoinEvent } = useEventActions({
            loadData,
            setMessage,
            setError,
            getRoleByEventId
        });

        await handleJoinEvent(1);

        expect(setError).toHaveBeenCalledWith("❌ Unable to join event");
    });

    it("should prevent organizer from leaving event", async () => {
        getRoleByEventId.mockReturnValue("organizer");

        const { handleLeaveEvent } = useEventActions({
            loadData,
            setMessage,
            setError,
            getRoleByEventId
        });

        await handleLeaveEvent(1);

        expect(api.leaveEvent).not.toHaveBeenCalled();
        expect(setError).toHaveBeenCalledWith("❌ Organizer cannot leave their own event");
    });

    it("should leave event successfully for participant", async () => {
        getRoleByEventId.mockReturnValue("participant");
        api.leaveEvent.mockResolvedValue();

        const { handleLeaveEvent } = useEventActions({
            loadData,
            setMessage,
            setError,
            getRoleByEventId
        });

        await handleLeaveEvent(1);

        expect(api.leaveEvent).toHaveBeenCalledWith(1);
        expect(setMessage).toHaveBeenCalledWith("👋 Successfully left event");
        expect(loadData).toHaveBeenCalled();
    });

    it("should handle leave event error", async () => {
        getRoleByEventId.mockReturnValue("participant");
        api.leaveEvent.mockRejectedValue(new Error("fail"));

        const { handleLeaveEvent } = useEventActions({
            loadData,
            setMessage,
            setError,
            getRoleByEventId
        });

        await handleLeaveEvent(1);

        expect(setError).toHaveBeenCalledWith("❌ Unable to leave event");
    });
});