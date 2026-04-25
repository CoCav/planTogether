import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Button from "../../../components/ui/Button";

describe("Button", () => {
    it("should render children", () => {
        render(<Button>Click me</Button>);

        expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
    });

    it("should apply variant class", () => {
        render(<Button variant="danger">Delete</Button>);

        expect(screen.getByRole("button", { name: /delete/i })).toHaveClass("btn-danger");
    });

    it("should be disabled when disabled is true", () => {
        render(<Button disabled>Submit</Button>);

        expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
    });

    it("should show loading text and be disabled when loading", () => {
        render(<Button loading>Submit</Button>);

        expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();
    });

    it("should call onClick when clicked", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        render(<Button onClick={onClick}>Click</Button>);

        await user.click(screen.getByRole("button", { name: /click/i }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should not call onClick when disabled", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        render(<Button disabled onClick={onClick}>Click</Button>);

        await user.click(screen.getByRole("button", { name: /click/i }));

        expect(onClick).not.toHaveBeenCalled();
    });
});