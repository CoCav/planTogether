import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useEventActionsWithConfirm from "../../../hooks/events/useEventActionsWithConfirm";

/* ==================================================
   USE EVENT ACTIONS WITH CONFIRM TESTS
   Tests confirmation layer for leave actions
================================================== */

const mockHandleJoinEvent = vi.fn();
const mockHandleLeaveEvent = vi.fn();

vi.mock("../../../hooks/events/useEventActions", () => ({
    default: () => ({
        handleJoinEvent: mockHandleJoinEvent,
        handleLeaveEvent: mockHandleLeaveEvent
    })
}));

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

describe("useEventActionsWithConfirm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("exposes handleJoinEvent from useEventActions", async () => {
        const { result } = setupHook();

        await act(async () => {
            await result.current.handleJoinEvent(1);
        });

        expect(mockHandleJoinEvent).toHaveBeenCalledWith(1);
    });

    it("calls handleLeaveEvent when user confirms", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(true);

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to leave this event?");
        expect(mockHandleLeaveEvent).toHaveBeenCalledWith(1);
    });

    it("does not call handleLeaveEvent when user cancels", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(false);

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(mockHandleLeaveEvent).not.toHaveBeenCalled();
    });

    it("shows co-organizer warning before leaving", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(true);

        const { result } = setupHook({
            getRoleByEventId: vi.fn(() => "co_organizer")
        });

        await act(async () => {
            await result.current.handleLeaveEvent(1);
        });

        expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to leave this event? You will lose your co-organizer role and will rejoin later as a participant.");
        expect(mockHandleLeaveEvent).toHaveBeenCalledWith(1);
    });
});
