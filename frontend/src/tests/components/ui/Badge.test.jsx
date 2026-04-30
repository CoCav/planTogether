import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "../../../components/ui/Badge";

/* ==================================================
   BADGE TESTS
   Tests role-based and custom badge rendering
================================================== */

describe("Badge", () => {
    it("renders organizer badge", () => {
        render(<Badge role="organizer" />);

        expect(screen.getByText(/organizer/i)).toHaveClass("badge-organizer");
    });

    it("renders co-organizer badge", () => {
        render(<Badge role="co_organizer" />);

        expect(screen.getByText(/co-organizer/i)).toHaveClass("badge-co");
    });

    it("renders participant badge", () => {
        render(<Badge role="participant" />);

        expect(screen.getByText(/participant/i)).toHaveClass("badge-participant");
    });

    it("renders custom variant and label", () => {
        render(<Badge variant="custom" label="Custom Label" />);

        expect(screen.getByText("Custom Label")).toHaveClass("badge-custom");
    });

    it("uses children as label", () => {
        render(<Badge variant="info">Child Label</Badge>);

        expect(screen.getByText("Child Label")).toHaveClass("badge-info");
    });

    it("renders nothing when no label or variant is provided", () => {
        const { container } = render(<Badge />);

        expect(container).toBeEmptyDOMElement();
    });
});
