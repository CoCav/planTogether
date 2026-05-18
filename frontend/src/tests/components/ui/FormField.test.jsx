import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FormField from "../../../components/ui/FormField";

/* ==================================================
   FORM FIELD TESTS
   Tests reusable form field wrapper rendering

   Handles:
   - label rendering
   - accessible label association
   - custom field content
   - validation error rendering
   - custom class merging

   Notes:
   - focuses on reusable form layout behavior
   - verifies label-to-control accessibility
================================================== */

describe("FormField", () => {

    /* =============================
       RENDERING
    ============================= */

    it("renders label and children", () => {
        render(
            <FormField label="Email" htmlFor="email">
                <input id="email" placeholder="Your email" />
            </FormField>
        );

        expect(screen.getByText("Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Your email")).toBeInTheDocument();
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("associates label with form control", () => {
        render(
            <FormField label="Email" htmlFor="email">
                <input id="email" />
            </FormField>
        );

        expect(screen.getByLabelText("Email")).toBeInTheDocument();
    });

    /* =============================
       VALIDATION ERROR
    ============================= */

    it("renders validation error when provided", () => {
        render(
            <FormField label="Email" error="Invalid email">
                <input />
            </FormField>
        );

        expect(screen.getByText("Invalid email")).toHaveClass("field-error");
    });

    /* =============================
       CUSTOM CLASSES
    ============================= */

    it("applies custom class", () => {
        render(
            <FormField label="Description" className="form-field-full">
                <textarea />
            </FormField>
        );

        expect(
            screen.getByText("Description").closest(".form-field")
        ).toHaveClass("form-field-full");
    });
});
