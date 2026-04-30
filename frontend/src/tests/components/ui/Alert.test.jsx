import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Alert from "../../../components/ui/Alert";

/* ==================================================
   ALERT TESTS
   Tests contextual feedback rendering
================================================== */

describe("Alert", () => {
    it("renders info alert by default", () => {
        render(<Alert>Info message</Alert>);

        const alert = screen.getByText("Info message");

        expect(alert).toHaveClass("alert", "alert-info");
        expect(alert).toHaveAttribute("role", "status");
    });

    it("renders danger alert with alert role", () => {
        render(<Alert type="danger">Error message</Alert>);

        const alert = screen.getByText("Error message");

        expect(alert).toHaveClass("alert-danger");
        expect(alert).toHaveAttribute("role", "alert");
    });

    it("supports custom class and role", () => {
        render(<Alert type="success" className="custom-alert" role="note">Success message</Alert>);

        const alert = screen.getByText("Success message");

        expect(alert).toHaveClass("alert-success", "custom-alert");
        expect(alert).toHaveAttribute("role", "note");
    });
});
