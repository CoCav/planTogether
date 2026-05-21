import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import FormField from "../../../components/ui/FormField";

/* ==================================================
   FORM FIELD TESTS
   Tests reusable form field wrapper rendering

   Handles:
   - label rendering
   - accessible label association
   - accessible error association
   - custom field content
   - validation error rendering
   - custom class merging

   Notes:
   - focuses on reusable form layout behavior
   - verifies label-to-control accessibility
================================================== */

describe("FormField", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderFormField = (props = {}) => {
        return render(
            <FormField
                label="Email"
                htmlFor="email"
                {...props}
            >
                {props.children || ((errorId) => (
                    <input
                        id="email"
                        placeholder="Your email"
                        aria-describedby={errorId}
                    />
                ))}
            </FormField>
        );
    };

    /* =============================
       RENDERING
    ============================= */

    it("should render label and children", () => {
        renderFormField();

        expect(screen.getByText("Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Your email")).toBeInTheDocument();
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("should associate label with form control", () => {
        renderFormField();

        expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    it("should associate validation error with form control", () => {
        renderFormField({
            error: "Invalid email"
        });

        expect(screen.getByLabelText("Email")).toHaveAttribute("aria-describedby", "email-error");
        expect(screen.getByText("Invalid email")).toHaveAttribute("id", "email-error");
    });

    /* =============================
       VALIDATION ERROR
    ============================= */

    it("should render validation error when provided", () => {
        renderFormField({
            error: "Invalid email"
        });

        expect(screen.getByText("Invalid email")).toHaveClass("form-field-error");
    });

    /* =============================
       CUSTOM CLASSES
    ============================= */

    it("should apply custom class", () => {
        renderFormField({
            label: "Description",
            className: "form-field-full",
            children: () => <textarea id="description" />
        });

        expect(screen.getByText("Description").closest(".form-field")).toHaveClass("form-field-full");
    });
});
