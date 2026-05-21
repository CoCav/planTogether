import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import Input from "../../../components/ui/Input";

/* ==================================================
   INPUT TESTS
   Tests styled input rendering and props forwarding

   Handles:
   - base input rendering
   - error class rendering
   - accessible invalid state
   - custom class merging
   - native input props forwarding
   - input change handler forwarding
================================================== */

describe("Input", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderInput = (props = {}) => {
        return render(
            <Input
                placeholder="Your name"
                {...props}
            />
        );
    };

    /* =============================
       RENDERING
    ============================= */

    it("should render input with base class", () => {
        renderInput();

        expect(screen.getByPlaceholderText("Your name")).toHaveClass("input");
    });

    /* =============================
       STATES
    ============================= */

    it("should apply error class", () => {
        renderInput({
            error: true,
            placeholder: "Your email"
        });

        expect(screen.getByPlaceholderText("Your email")).toHaveClass("error");
    });

    it("should expose accessible invalid state when error exists", () => {
        renderInput({
            error: true,
            placeholder: "Your email"
        });

        expect(screen.getByPlaceholderText("Your email")).toHaveAttribute("aria-invalid", "true");
    });

    /* =============================
       CUSTOM CLASSES
    ============================= */

    it("should apply custom class", () => {
        renderInput({
            className: "custom-input",
            placeholder: "Search"
        });

        expect(screen.getByPlaceholderText("Search")).toHaveClass("custom-input");
    });

    /* =============================
       DOM PROPS
    ============================= */

    it("should forward native input props", () => {
        renderInput({
            type: "email",
            name: "email",
            value: "",
            readOnly: true,
            placeholder: "Email"
        });

        const input = screen.getByPlaceholderText("Email");

        expect(input).toHaveAttribute("type", "email");
        expect(input).toHaveAttribute("name", "email");
        expect(input).toHaveAttribute("readonly");
    });

    /* =============================
       INTERACTIONS
    ============================= */

    it("should forward change handler", () => {
        const onChange = vi.fn();

        renderInput({
            type: "email",
            name: "email",
            value: "",
            onChange,
            placeholder: "Email"
        });

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: {
                value: "john@test.com"
            }
        });

        expect(onChange).toHaveBeenCalled();
    });
});
