import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import ToastContainer from "../../../components/ui/ToastContainer";

import useToast from "../../../hooks/useToast";

/* ==================================================
   TOAST CONTAINER TESTS
   Tests global toast notification region rendering

   Handles:
   - empty toast state rendering
   - notification region rendering
   - toast list rendering
   - toast variant forwarding
   - toast dismissal forwarding

   Notes:
   - useToast is mocked to isolate container orchestration
   - Toast component is kept real to verify integration
================================================== */

vi.mock("../../../hooks/useToast");

describe("ToastContainer", () => {

    /* =============================
       TEST DATA
    ============================= */

    const removeToast = vi.fn();

    const toasts = [
        {
            id: "toast-1",
            message: "First toast",
            type: "success"
        },
        {
            id: "toast-2",
            message: "Second toast",
            type: "danger"
        }
    ];

    /* =============================
       TEST HELPERS
    ============================= */

    const setupMocks = (overrides = {}) => {
        useToast.mockReturnValue({
            toasts,
            removeToast,
            ...overrides
        });
    };

    const renderComp = () => {
        return render(<ToastContainer />);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        setupMocks();
    });

    /* =============================
       EMPTY STATE
    ============================= */

    it("should render nothing when there are no toasts", () => {
        setupMocks({
            toasts: []
        });

        const { container } = renderComp();

        expect(container).toBeEmptyDOMElement();
    });

    /* =============================
       RENDER
    ============================= */

    it("should render notification region when toasts exist", () => {
        renderComp();

        expect(screen.getByRole("region", {
            name: "Notifications"
        })).toHaveClass("toast-container");
    });

    it("should render toast messages", () => {
        renderComp();

        expect(screen.getByText("First toast")).toBeInTheDocument();
        expect(screen.getByText("Second toast")).toBeInTheDocument();
    });

    it("should forward toast variants", () => {
        renderComp();

        expect(screen.getByText("First toast").closest(".toast")).toHaveClass("toast-success");
        expect(screen.getByText("Second toast").closest(".toast")).toHaveClass("toast-danger");
    });

    /* =============================
       DISMISSAL
    ============================= */

    it("should remove selected toast when close button is clicked", () => {
        renderComp();

        const closeButtons = screen.getAllByRole("button", {
            name: /close notification/i
        });

        fireEvent.click(closeButtons[0]);

        expect(removeToast).toHaveBeenCalledWith("toast-1");
    });

    it("should remove second toast when second close button is clicked", () => {
        renderComp();

        const closeButtons = screen.getAllByRole("button", {
            name: /close notification/i
        });

        fireEvent.click(closeButtons[1]);

        expect(removeToast).toHaveBeenCalledWith("toast-2");
    });
});
