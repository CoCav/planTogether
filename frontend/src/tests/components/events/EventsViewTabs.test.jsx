import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import EventViewTabs from "../../../components/events/EventsViewTabs";

/* ==================================================
   EVENT VIEW TABS TESTS
   Tests event list view navigation tabs
================================================== */

const views = [
    { key: "all", label: "All", icon: "📋" },
    { key: "upcoming", label: "Upcoming", icon: "📅" },
    { key: "archives", label: "Archives", icon: "🗂️" }
];

const getTabButton = (label) =>
    screen.getAllByRole("button").find((button) =>
        button.textContent.includes(label)
    );

describe("EventViewTabs", () => {
    it("renders all view tabs", () => {
        render(<EventViewTabs views={views} activeView="all" onChange={vi.fn()} />);

        expect(getTabButton("All")).toBeInTheDocument();
        expect(getTabButton("Upcoming")).toBeInTheDocument();
        expect(getTabButton("Archives")).toBeInTheDocument();
    });

    it("applies active class to selected tab", () => {
        render(<EventViewTabs views={views} activeView="upcoming" onChange={vi.fn()} />);

        expect(getTabButton("Upcoming")).toHaveClass("active");
        expect(getTabButton("All")).not.toHaveClass("active");
        expect(getTabButton("Archives")).not.toHaveClass("active");
    });

    it("sets aria-pressed on selected tab", () => {
        render(<EventViewTabs views={views} activeView="archives" onChange={vi.fn()} />);

        expect(getTabButton("Archives")).toHaveAttribute("aria-pressed", "true");
        expect(getTabButton("All")).toHaveAttribute("aria-pressed", "false");
    });

    it("calls onChange with selected view when clicking a tab", () => {
        const onChange = vi.fn();

        render(<EventViewTabs views={views} activeView="all" onChange={onChange} />);

        fireEvent.click(getTabButton("Archives"));

        expect(onChange).toHaveBeenCalledWith("archives");
    });
});
