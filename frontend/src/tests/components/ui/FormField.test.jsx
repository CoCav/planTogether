import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import FormField from "../../../components/ui/FormField";

/* ==================================================
   FORM FIELD TESTS
   Tests label, field content and validation error
================================================== */

describe("FormField", () => {
    it("renders label and children", () => {
        render(
            <FormField label="Email">
                <input placeholder="Your email" />
            </FormField>
        );

        expect(screen.getByText("Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Your email")).toBeInTheDocument();
    });

    it("renders validation error when provided", () => {
        render(
            <FormField label="Email" error="Invalid email">
                <input />
            </FormField>
        );

        expect(screen.getByText("Invalid email")).toHaveClass("field-error");
    });

    it("applies custom class", () => {
        render(
            <FormField label="Description" className="form-field-full">
                <textarea />
            </FormField>
        );

        expect(screen.getByText("Description").closest(".form-field")).toHaveClass("form-field-full");
    });
});
