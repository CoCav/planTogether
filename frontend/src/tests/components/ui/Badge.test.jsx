import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "../../../components/ui/Badge";

describe("Badge", () => {
    it("should render organizer badge", () => {
        render(<Badge role="organizer" />);

        expect(screen.getByText(/organizer/i)).toHaveClass("badge-organizer");
    });

    it("should render co-organizer badge", () => {
        render(<Badge role="co_organizer" />);

        expect(screen.getByText(/co-organizer/i)).toHaveClass("badge-co");
    });

    it("should render participant badge by default for unknown role", () => {
        render(<Badge role="participant" />);

        expect(screen.getByText(/participant/i)).toHaveClass("badge-participant");
    });

    it("should render custom variant and label", () => {
        render(<Badge variant="custom" label="Custom Label" />);

        expect(screen.getByText("Custom Label")).toHaveClass("badge-custom");
    });

    it("should allow children as label", () => {
        render(<Badge variant="info">Child Label</Badge>);

        expect(screen.getByText("Child Label")).toHaveClass("badge-info");
    });

    it("should return null when no label or variant is provided", () => {
        const { container } = render(<Badge />);

        expect(container).toBeEmptyDOMElement();
    });
});