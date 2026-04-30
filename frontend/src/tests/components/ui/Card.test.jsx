import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Card from "../../../components/ui/Card";

/* ==================================================
   CARD TESTS
   Tests generic card container rendering
================================================== */

describe("Card", () => {
    it("renders children", () => {
        render(<Card>Card content</Card>);

        expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("applies custom class", () => {
        render(<Card className="custom-card">Content</Card>);

        expect(screen.getByText("Content")).toHaveClass("card", "custom-card");
    });

    it("forwards DOM props", () => {
        const onClick = vi.fn();

        render(<Card data-testid="card" onClick={onClick}>Content</Card>);

        fireEvent.click(screen.getByTestId("card"));

        expect(onClick).toHaveBeenCalled();
    });
});
