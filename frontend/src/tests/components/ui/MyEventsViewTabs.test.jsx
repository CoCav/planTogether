import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MyEventsViewTabs from "../../../components/ui/MyEventsViewTabs";

describe("MyEventsViewTabs", () => {

    it("should render all tabs", () => {
        render(<MyEventsViewTabs activeView="created" onChange={vi.fn()} />);

        expect(screen.getByRole("button", { name: /^created$/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^created history$/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^joined$/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^joined history$/i })).toBeInTheDocument();
    });

    it("should highlight active tab", () => {
        render(<MyEventsViewTabs activeView="joined" onChange={vi.fn()} />);

        expect(screen.getByRole("button", { name: /^joined$/i })).toHaveClass("active");
    });

    it("should call onChange when clicking a tab", () => {
        const onChange = vi.fn();

        render(<MyEventsViewTabs activeView="created" onChange={onChange} />);

        fireEvent.click(screen.getByRole("button", { name: /^joined history$/i }));

        expect(onChange).toHaveBeenCalledWith("joinedHistory");
    });
});