import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useEventActionsWithConfirm from "../../hooks/useEventActionsWithConfirm";

// ----------------------
// Mocks
// ----------------------

const mockHandleJoinEvent = vi.fn();
const mockHandleLeaveEvent = vi.fn();

vi.mock("../../hooks/useEventActions", () => ({
    default: () => ({
        handleJoinEvent: mockHandleJoinEvent,
        handleLeaveEvent: mockHandleLeaveEvent
    })
}));

// ----------------------
// Helpers
// ----------------------

const setupHook = (overrides = {}) => {
    const props = {
        loadData: vi.fn(),
        setMessage: vi.fn(),
        setError: vi.fn(),
        getRoleByEventId: vi.fn(() => "participant"),
        ...overrides
    };

    const result = renderHook(() => useEventActionsWithConfirm(props));

    return {
        ...result,
        props
    };
};

// ----------------------
// Tests
// ----------------------

describe("useEventActionsWithConfirm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should expose handleJoinEvent from useEventActions", async () => {
        const { result } = setupHook();

        await act(async () => {
            await result.current.handleJoinEvent(1);
        });

        expect(mockHandleJoinEvent).toHaveBeenCalledWith(1);
    });

    it("should call handleLeaveEvent when user confirms", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(true);

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(window.confirm).toHaveBeenCalledWith(
            "Are you sure you want to leave this event?"
        );
        expect(mockHandleLeaveEvent).toHaveBeenCalledWith(1);
    });

    it("should not call handleLeaveEvent when user cancels", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(false);

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(mockHandleLeaveEvent).not.toHaveBeenCalled();
    });

    it("should show co-organizer warning message before leaving", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(true);

        const { result } = setupHook({
            getRoleByEventId: vi.fn(() => "co_organizer")
        });

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(window.confirm).toHaveBeenCalledWith(
            "Are you sure you want to leave this event? You will lose your co-organizer role and will rejoin later as a participant."
        );
        expect(mockHandleLeaveEvent).toHaveBeenCalledWith(1);
    });
});