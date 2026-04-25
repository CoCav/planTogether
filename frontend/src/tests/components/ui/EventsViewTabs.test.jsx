import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EventsViewTabs from "../../../components/ui/EventsViewTabs";

describe("EventsViewTabs", () => {
    it("should render all view tabs", () => {
        render(<EventsViewTabs activeView="all" onChange={vi.fn()} />);

        expect(screen.getByText(/all/i)).toBeInTheDocument();
        expect(screen.getByText(/upcoming/i)).toBeInTheDocument();
        expect(screen.getByText(/archives/i)).toBeInTheDocument();
    });

    it("should apply active class to the selected tab", () => {
        render(<EventsViewTabs activeView="upcoming" onChange={vi.fn()} />);

        expect(screen.getByRole("button", { name: /upcoming/i })).toHaveClass("active");
        expect(screen.getByRole("button", { name: /all/i })).not.toHaveClass("active");
        expect(screen.getByRole("button", { name: /archives/i })).not.toHaveClass("active");
    });

    it("should call onChange with selected view when clicking a tab", () => {
        const onChange = vi.fn();

        render(<EventsViewTabs activeView="all" onChange={onChange} />);

        fireEvent.click(screen.getByRole("button", { name: /archives/i }));

        expect(onChange).toHaveBeenCalledWith("archives");
    });
});