import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import MyEventsViewTabs from "../../../components/events/MyEventsViewTabs";

/* ==================================================
   MY EVENTS VIEW TABS TESTS
   Tests My Events navigation tabs
================================================== */

describe("MyEventsViewTabs", () => {
    it("renders all tabs", () => {
        render(<MyEventsViewTabs activeView="created" onChange={vi.fn()} />);

        expect(screen.getByRole("button", { name: /^created$/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^created history$/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^joined$/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^joined history$/i })).toBeInTheDocument();
    });

    it("applies active class to selected tab", () => {
        render(<MyEventsViewTabs activeView="joined" onChange={vi.fn()} />);

        expect(screen.getByRole("button", { name: /^joined$/i })).toHaveClass("active");
        expect(screen.getByRole("button", { name: /^created$/i })).not.toHaveClass("active");
    });

    it("calls onChange with selected view when clicking a tab", () => {
        const onChange = vi.fn();

        render(<MyEventsViewTabs activeView="created" onChange={onChange} />);

        fireEvent.click(screen.getByRole("button", { name: /^joined history$/i }));

        expect(onChange).toHaveBeenCalledWith("joinedHistory");
    });
});
