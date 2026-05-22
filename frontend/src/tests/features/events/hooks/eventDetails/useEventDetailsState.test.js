import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import useEventDetailsState from "../../../../../features/events/hooks/eventDetails/useEventDetailsState";

/* ==================================================
   USE EVENT DETAILS STATE TESTS
   Tests event details page UI state management

   Handles:
   - initial feedback state
   - initial loading state
   - feedback state updates
   - loading state updates
================================================== */

describe("useEventDetailsState", () => {

    /* =============================
       INITIAL STATE
    ============================= */

    it("initializes empty feedback state", () => {
        const { result } = renderHook(() =>
            useEventDetailsState()
        );

        expect(result.current.feedback.message).toBe("");

        expect(result.current.feedback.error).toBe("");
    });

    it("initializes loading state", () => {
        const { result } = renderHook(() =>
            useEventDetailsState()
        );

        expect(result.current.loadingState.loading).toBe(true);
    });

    /* =============================
       FEEDBACK STATE
    ============================= */

    it("updates feedback state", () => {
        const { result } = renderHook(() =>
            useEventDetailsState()
        );

        act(() => {
            result.current.feedback.setMessage("Success message");

            result.current.feedback.setError("Error message");
        });

        expect(result.current.feedback.message).toBe("Success message");

        expect(result.current.feedback.error).toBe("Error message");
    });

    /* =============================
       LOADING STATE
    ============================= */

    it("updates loading state", () => {
        const { result } = renderHook(() =>
            useEventDetailsState()
        );

        act(() => {
            result.current.loadingState.setLoading(false);
        });

        expect(result.current.loadingState.loading).toBe(false);
    });
});
