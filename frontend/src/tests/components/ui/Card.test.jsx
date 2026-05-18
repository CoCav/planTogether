import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import Card from "../../../components/ui/Card";

/* ==================================================
   CARD TESTS
   Tests generic card container rendering

   Handles:
   - children rendering
   - default card class
   - custom class merging
   - forwarded DOM props
   - event handler forwarding

   Notes:
   - focuses on reusable UI container behavior
================================================== */

describe("Card", () => {

    /* =============================
       RENDERING
    ============================= */

    it("renders children", () => {
        render(<Card>Card content</Card>);

        expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("applies default card class", () => {
        render(<Card>Content</Card>);

        expect(screen.getByText("Content")).toHaveClass("card");
    });

    /* =============================
       CUSTOM CLASSES
    ============================= */

    it("merges custom class with default card class", () => {
        render(<Card className="custom-card">Content</Card>);

        expect(screen.getByText("Content")).toHaveClass("card", "custom-card");
    });

    /* =============================
       DOM PROPS
    ============================= */

    it("forwards DOM props", () => {
        render(<Card data-testid="card">Content</Card>);

        expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("forwards event handlers", () => {
        const onClick = vi.fn();

        render(
            <Card data-testid="card" onClick={onClick}>
                Content
            </Card>
        );

        fireEvent.click(screen.getByTestId("card"));

        expect(onClick).toHaveBeenCalled();
    });
});
