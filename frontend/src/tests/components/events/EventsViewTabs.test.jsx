import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import EventViewTabs from "../../../components/events/EventsViewTabs";

/* ==================================================
   EVENT VIEW TABS TESTS
   Tests event list view navigation tabs
================================================== */

describe("EventViewTabs", () => {
    it("renders all view tabs", () => {
        render(<EventViewTabs activeView="all" onChange={vi.fn()} />);

        expect(screen.getByRole("button", { name: /all/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /upcoming/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /archives/i })).toBeInTheDocument();
    });

    it("applies active class to selected tab", () => {
        render(<EventViewTabs activeView="upcoming" onChange={vi.fn()} />);

        expect(screen.getByRole("button", { name: /upcoming/i })).toHaveClass("active");
        expect(screen.getByRole("button", { name: /all/i })).not.toHaveClass("active");
        expect(screen.getByRole("button", { name: /archives/i })).not.toHaveClass("active");
    });

    it("sets aria-pressed on selected tab", () => {
        render(<EventViewTabs activeView="archives" onChange={vi.fn()} />);

        expect(screen.getByRole("button", { name: /archives/i })).toHaveAttribute(
            "aria-pressed",
            "true"
        );

        expect(screen.getByRole("button", { name: /all/i })).toHaveAttribute(
            "aria-pressed",
            "false"
        );
    });

    it("calls onChange with selected view when clicking a tab", () => {
        const onChange = vi.fn();

        render(<EventViewTabs activeView="all" onChange={onChange} />);

        fireEvent.click(screen.getByRole("button", { name: /archives/i }));

        expect(onChange).toHaveBeenCalledWith("archives");
    });
});
