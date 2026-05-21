import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Button from "../../../components/ui/Button";

/* ==================================================
   BUTTON TESTS
   Tests button rendering, variants and interactions

   Handles:
   - default rendering
   - button variants
   - loading state
   - accessible busy state
   - disabled state
   - click interactions
   - forwarded props
================================================== */

describe("Button", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderButton = (props = {}) => {
        return render(
            <Button {...props}>
                {props.children || "Button"}
            </Button>
        );
    };

    /* =============================
       RENDERING
    ============================= */

    it("should render button children", () => {
        renderButton({
            children: "Click me"
        });

        expect(screen.getByRole("button", {
            name: /click me/i
        })).toBeInTheDocument();
    });

    it("should use button type by default", () => {
        renderButton();

        expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });

    it("should support custom button type", () => {
        renderButton({
            type: "submit"
        });

        expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });

    /* =============================
       VARIANTS
    ============================= */

    it("should apply primary variant by default", () => {
        renderButton();

        expect(screen.getByRole("button")).toHaveClass("btn-primary");
    });

    it("should apply custom variant class", () => {
        renderButton({
            variant: "danger",
            children: "Delete"
        });

        expect(screen.getByRole("button", {
            name: /delete/i
        })).toHaveClass("btn-danger");
    });

    it("should support custom class name", () => {
        renderButton({
            className: "custom-button"
        });

        expect(screen.getByRole("button")).toHaveClass("custom-button");
    });

    /* =============================
       DISABLED STATE
    ============================= */

    it("should disable button when disabled prop is true", () => {
        renderButton({
            disabled: true
        });

        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("should show loading text and disable button when loading", () => {
        renderButton({
            loading: true,
            children: "Submit"
        });

        expect(screen.getByRole("button", {
            name: /loading/i
        })).toBeDisabled();
    });

    it("should expose accessible busy state when loading", () => {
        renderButton({
            loading: true
        });

        expect(
            screen.getByRole("button", {
                name: /loading/i
            })
        ).toHaveAttribute("aria-busy", "true");
    });

    /* =============================
       INTERACTIONS
    ============================= */

    it("should call onClick when clicked", async () => {
        const user = userEvent.setup();

        const onClick = vi.fn();

        renderButton({
            onClick,
            children: "Click"
        });

        await user.click(screen.getByRole("button", {
            name: /click/i
        }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", async () => {
        const user = userEvent.setup();

        const onClick = vi.fn();

        renderButton({
            disabled: true,
            onClick,
            children: "Click"
        });

        await user.click(screen.getByRole("button", {
            name: /click/i
        }));

        expect(onClick).not.toHaveBeenCalled();
    });

    it("should not call onClick when loading", async () => {
        const user = userEvent.setup();

        const onClick = vi.fn();

        renderButton({
            loading: true,
            onClick
        });

        await user.click(screen.getByRole("button", {
            name: /loading/i
        }));

        expect(onClick).not.toHaveBeenCalled();
    });
});
