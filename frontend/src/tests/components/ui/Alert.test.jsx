import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import Alert from "../../../components/ui/Alert";

/* ==================================================
   ALERT TESTS
   Tests contextual feedback rendering

   Handles:
   - default info alert rendering
   - success and danger variants
   - default variant icons
   - accessibility roles
   - custom class support
   - custom role override
   - decorative icon accessibility
================================================== */

describe("Alert", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderAlert = (props = {}) => {
        return render(
            <Alert {...props}>
                {props.children || "Alert message"}
            </Alert>
        );
    };

    const CustomIcon = () => (
        <span data-testid="custom-icon">
            Custom
        </span>
    );

    /* =============================
       VARIANTS
    ============================= */

    it("should render info alert by default", () => {
        renderAlert();

        expect(screen.getByRole("status")).toHaveClass("alert", "alert-info");
    });

    it("should render success alert variant", () => {
        renderAlert({
            type: "success",
            children: "Success message"
        });

        expect(screen.getByRole("status")).toHaveClass("alert-success");
    });

    it("should render danger alert variant", () => {
        renderAlert({
            type: "danger",
            children: "Error message"
        });

        expect(screen.getByRole("alert")).toHaveClass("alert-danger");
    });

    it("should render alert content", () => {
        renderAlert({
            children: "Custom alert message"
        });

        expect(screen.getByText("Custom alert message")).toBeInTheDocument();
    });

    /* =============================
       ICONS
    ============================= */

    it("should render decorative variant icon", () => {
        const { container } = renderAlert();

        const icon = container.querySelector(".alert-icon");

        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute("aria-hidden", "true");
    });

    /* =============================
       CUSTOM ICONS
    ============================= */

    it("should render custom icon when provided", () => {
        renderAlert({
            icon: CustomIcon
        });

        expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("should use status role for non-danger alerts", () => {
        renderAlert();

        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("should use alert role for danger alerts", () => {
        renderAlert({
            type: "danger",
            children: "Error message"
        });

        expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should support custom role override", () => {
        renderAlert({
            role: "note"
        });

        expect(screen.getByRole("note")).toBeInTheDocument();
    });

    /* =============================
       CUSTOM CLASSES
    ============================= */

    it("should support custom class name", () => {
        renderAlert({
            className: "custom-alert"
        });

        expect(screen.getByRole("status")).toHaveClass("custom-alert");
    });
});
