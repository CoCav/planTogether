import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import Alert from "../../../components/ui/Alert";

/* ==================================================
   ALERT TESTS
   Tests contextual feedback rendering

   Handles:
   - default info alert rendering
   - success and danger variants
   - accessibility roles
   - custom class support
   - custom role override
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

    /* =============================
       VARIANTS
    ============================= */

    it("should render info alert by default", () => {
        renderAlert();

        const alert = screen.getByText("Alert message");

        expect(alert).toHaveClass("alert", "alert-info");
    });

    it("should render success alert variant", () => {
        renderAlert({
            type: "success",
            children: "Success message"
        });

        expect(screen.getByText("Success message")).toHaveClass("alert-success");
    });

    it("should render danger alert variant", () => {
        renderAlert({
            type: "danger",
            children: "Error message"
        });

        expect(screen.getByText("Error message")).toHaveClass("alert-danger");
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("should use status role for non-danger alerts", () => {
        renderAlert();

        expect(screen.getByText("Alert message")).toHaveAttribute("role", "status");
    });

    it("should use alert role for danger alerts", () => {
        renderAlert({
            type: "danger",
            children: "Error message"
        });

        expect(screen.getByText("Error message")).toHaveAttribute("role", "alert");
    });

    it("should support custom role override", () => {
        renderAlert({
            role: "note"
        });

        expect(screen.getByText("Alert message")).toHaveAttribute("role", "note");
    });

    /* =============================
       CUSTOM CLASSES
    ============================= */

    it("should support custom class name", () => {
        renderAlert({
            className: "custom-alert"
        });

        expect(screen.getByText("Alert message")).toHaveClass("custom-alert");
    });
});
