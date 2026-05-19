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
   - forwarded event handlers
================================================== */

describe("Card", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderCard = (props = {}) => {
        return render(
            <Card {...props}>
                {props.children || "Card content"}
            </Card>
        );
    };

    /* =============================
       RENDERING
    ============================= */

    it("should render card children", () => {
        renderCard();

        expect(screen.getByText("Card content")).toBeInTheDocument();
    });

    it("should apply default card class", () => {
        renderCard();

        expect(screen.getByText("Card content")).toHaveClass("card");
    });

    /* =============================
       CUSTOM CLASSES
    ============================= */

    it("should merge custom class with default card class", () => {
        renderCard({
            className: "custom-card"
        });

        expect(screen.getByText("Card content")).toHaveClass("card", "custom-card");
    });

    /* =============================
       DOM PROPS
    ============================= */

    it("should forward DOM props", () => {
        renderCard({
            "data-testid": "card"
        });

        expect(screen.getByTestId("card")).toBeInTheDocument();
    });

    it("should forward DOM attributes", () => {
        renderCard({
            id: "custom-card"
        });

        expect(screen.getByText("Card content")).toHaveAttribute("id", "custom-card");
    });

    /* =============================
       INTERACTIONS
    ============================= */

    it("should forward event handlers", () => {
        const onClick = vi.fn();

        renderCard({
            "data-testid": "card",
            onClick
        });

        fireEvent.click(screen.getByTestId("card"));

        expect(onClick).toHaveBeenCalledTimes(1);
    });
});
