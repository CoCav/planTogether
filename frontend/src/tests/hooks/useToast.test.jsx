import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";

import ToastContext from "../../context/toast/ToastContext";
import useToast from "../../hooks/useToast";

/* ==================================================
   USE TOAST TESTS
   Tests toast context hook

   Handles:
   - toast context value access
   - toast state exposure
   - toast actions exposure
   - provider usage guard
================================================== */

describe("useToast", () => {

    /* =============================
       TOAST CONTEXT
    ============================= */

    it("should return the current toast context value", () => {
        const toastValue = {
            toasts: [],
            addToast: vi.fn(),
            removeToast: vi.fn(),
            info: vi.fn(),
            success: vi.fn(),
            warning: vi.fn(),
            danger: vi.fn()
        };

        const wrapper = ({ children }) => (
            <ToastContext.Provider value={toastValue}>
                {children}
            </ToastContext.Provider>
        );

        const { result } = renderHook(() => useToast(), {
            wrapper
        });

        expect(result.current).toBe(toastValue);
    });

    it("should throw when used outside ToastProvider", () => {
        expect(() => {
            renderHook(() => useToast());
        }).toThrow("useToast must be used within a ToastProvider.");
    });
});
