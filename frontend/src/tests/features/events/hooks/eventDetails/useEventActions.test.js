import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useEventActions from "../../../../../features/events/hooks/eventDetails/useEventActions";

import { deleteEvent } from "../../../../../api/events/eventApi";

import { createMutationHookProps } from "../../../../helpers/hooks/createHookProps";
import { mockConfirmAccepted } from "../../../../helpers/mocks/mockWindowConfirm";

/* ==================================================
   USE EVENT ACTIONS TESTS
   Tests organizer event actions

   Handles:
   - event deletion confirmation
   - event deletion redirect
   - delete cancellation
   - delete API error handling

   Notes:
   - uses reusable mutation hook prop helpers
   - uses reusable confirmation dialog mock helpers
================================================== */

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate
}));

vi.mock("../../../../../api/events/eventApi", () => ({
    deleteEvent: vi.fn()
}));

describe("useEventActions", () => {
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

    // Render event actions hook
    const setupHook = () => {
        return renderHook(() =>
            useEventActions(hookProps)
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

        expect(hookProps.setError).toHaveBeenCalledWith("");

        expect(hookProps.setMessage).toHaveBeenCalledWith("");

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
        deleteEvent.mockRejectedValue(
            new Error("Request failed")
        );

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleDeleteEvent();
        });

        expect(hookProps.setError).toHaveBeenCalledWith("Request failed");

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
