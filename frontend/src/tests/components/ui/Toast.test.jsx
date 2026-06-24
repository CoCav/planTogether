import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import Toast from "../../../components/ui/Toast";

/* ==================================================
   TOAST TESTS
   Tests temporary feedback notification rendering

   Handles:
   - default info toast rendering
   - success, warning and danger variants
   - default variant icons
   - manual dismissal action
   - accessibility roles
   - decorative icon accessibility
================================================== */

describe("Toast", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderToast = (props = {}) => {
        return render(
            <Toast
                message={props.message || "Toast message"}
                type={props.type}
                onClose={props.onClose || vi.fn()}
            />
        );
    };

    /* =============================
       VARIANTS
    ============================= */

    it("should render info toast by default", () => {
        renderToast();

        expect(screen.getByRole("status")).toHaveClass("toast", "toast-info");
    });

    it("should render success toast variant", () => {
        renderToast({
            type: "success",
            message: "Success message"
        });

        expect(screen.getByRole("status")).toHaveClass("toast-success");
    });

    it("should render warning toast variant", () => {
        renderToast({
            type: "warning",
            message: "Warning message"
        });

        expect(screen.getByRole("status")).toHaveClass("toast-warning");
    });

    it("should render danger toast variant", () => {
        renderToast({
            type: "danger",
            message: "Error message"
        });

        expect(screen.getByRole("alert")).toHaveClass("toast-danger");
    });

    it("should fallback to info icon and unknown class for unknown type", () => {
        renderToast({
            type: "custom",
            message: "Custom toast"
        });

        expect(screen.getByRole("status")).toHaveClass("toast-custom");
    });

    it("should render toast message", () => {
        renderToast({
            message: "Custom toast message"
        });

        expect(screen.getByText("Custom toast message")).toBeInTheDocument();
    });

    /* =============================
       ICONS
    ============================= */

    it("should render decorative variant icon", () => {
        const { container } = renderToast();

        const icon = container.querySelector(".toast-icon");

        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("aria-hidden", "true");
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("should use status role for non-danger toasts", () => {
        renderToast();

        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should use alert role for danger toasts", () => {
        renderToast({
            type: "danger",
            message: "Error message"
        });

        expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should render accessible close button", () => {
        renderToast();

        expect(screen.getByRole("button", {
            name: /close notification/i
        })).toBeInTheDocument();
    });

    /* =============================
       DISMISSAL
    ============================= */

    it("should call onClose when close button is clicked", () => {
        const onClose = vi.fn();

        renderToast({
            onClose
        });

        fireEvent.click(screen.getByRole("button", {
            name: /close notification/i
        }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
