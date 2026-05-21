import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import Select from "../../../components/ui/Select";

/* ==================================================
   SELECT TESTS
   Tests select rendering and props forwarding

   Handles:
   - option rendering
   - wrapper and select classes
   - error state
   - accessible invalid state
   - native select props forwarding
   - decorative icon accessibility
================================================== */

describe("Select", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderSelect = (props = {}) => {
        return render(
            <Select {...props}>
                {props.children || (
                    <>
                        <option value="1">Option 1</option>
                        <option value="2">Option 2</option>
                    </>
                )}
            </Select>
        );
    };

    /* =============================
       RENDERING
    ============================= */

    it("should render select options", () => {
        renderSelect();

        expect(screen.getByText("Option 1")).toBeInTheDocument();
        expect(screen.getByText("Option 2")).toBeInTheDocument();
    });

    /* =============================
       CUSTOM CLASSES
    ============================= */

    it("should apply custom class to wrapper", () => {
        const { container } = renderSelect({
            className: "custom-select"
        });

        expect(container.firstChild).toHaveClass(
            "select-wrapper",
            "custom-select"
        );
    });

    /* =============================
       STATES
    ============================= */

    it("should apply error class to wrapper and select", () => {
        const { container } = renderSelect({
            error: true
        });

        expect(container.firstChild).toHaveClass("error");

        expect(screen.getByRole("combobox")).toHaveClass("error");
    });

    it("should expose accessible invalid state when error exists", () => {
        renderSelect({
            error: true
        });

        expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
    });

    /* =============================
       DOM PROPS
    ============================= */

    it("should forward native select props", () => {
        renderSelect({
            name: "eventType",
            disabled: true
        });

        const select = screen.getByRole("combobox");

        expect(select).toHaveAttribute("name", "eventType");
        expect(select).toBeDisabled();
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("should render decorative icon as hidden from assistive technologies", () => {
        renderSelect();

        expect(document.querySelector(".select-icon")).toHaveAttribute("aria-hidden", "true");
    });
});
