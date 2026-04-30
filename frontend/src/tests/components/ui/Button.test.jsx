import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "../../../components/ui/Button";

/* ==================================================
   BUTTON TESTS
   Tests button variants, states and click behavior
================================================== */

describe("Button", () => {
    it("renders children", () => {
        render(<Button>Click me</Button>);

        expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
    });

    it("applies variant class", () => {
        render(<Button variant="danger">Delete</Button>);

        expect(screen.getByRole("button", { name: /delete/i })).toHaveClass(
            "btn-danger"
        );
    });

    it("is disabled when disabled is true", () => {
        render(<Button disabled>Submit</Button>);

        expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
    });

    it("shows loading text and disables button when loading", () => {
        render(<Button loading>Submit</Button>);

        expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();
    });

    it("calls onClick when clicked", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        render(<Button onClick={onClick}>Click</Button>);

        await user.click(screen.getByRole("button", { name: /click/i }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        render(<Button disabled onClick={onClick}>Click</Button>);

        await user.click(screen.getByRole("button", { name: /click/i }));

        expect(onClick).not.toHaveBeenCalled();
    });
});
