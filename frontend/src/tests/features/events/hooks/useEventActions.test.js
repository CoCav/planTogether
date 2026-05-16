import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useEventActions from "../../../../features/events/hooks/useEventActions";

import { deleteEvent } from "../../../../api/events/eventApi";

/* ==================================================
   USE EVENT ACTIONS TESTS
   Tests organizer event actions

   Handles:
   - event deletion confirmation
   - event deletion redirect
   - delete cancellation
   - delete API error handling
================================================== */

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate
}));

vi.mock("../../../../api/events/eventApi", () => ({
    deleteEvent: vi.fn()
}));

describe("useEventActions", () => {
    let setMessage;
    let setError;

    beforeEach(() => {
        vi.clearAllMocks();

        setMessage = vi.fn();
        setError = vi.fn();

        vi.spyOn(window, "confirm").mockReturnValue(true);
    });

    /* =============================
       TEST HELPERS
    ============================= */

    const setupHook = () => {
        return renderHook(() =>
            useEventActions({
                eventId: 1,
                setMessage,
                setError
            })
        );
    };

    /* =============================
       DELETE EVENT
    ============================= */

    it("should delete event and redirect when user confirms", async () => {
        deleteEvent.mockResolvedValue();

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleDeleteEvent();
        });

        expect(window.confirm).toHaveBeenCalledWith(
            "Are you sure you want to delete this event?"
        );

        expect(setError).toHaveBeenCalledWith("");
        expect(setMessage).toHaveBeenCalledWith("");

        expect(deleteEvent).toHaveBeenCalledWith(1);
        expect(mockNavigate).toHaveBeenCalledWith("/events");
    });

    it("should not delete event when user cancels", async () => {
        window.confirm.mockReturnValue(false);

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleDeleteEvent();
        });

        expect(deleteEvent).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should handle delete event errors", async () => {
        deleteEvent.mockRejectedValue(new Error("Request failed"));

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleDeleteEvent();
        });

        expect(setError).toHaveBeenCalledWith("Request failed");
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
