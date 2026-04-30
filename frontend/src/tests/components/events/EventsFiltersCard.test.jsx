import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import EventsFilterCard from "../../../components/events/EventsFilterCard";

/* ==================================================
   EVENTS FILTER CARD TESTS
   Tests event filter form rendering and interactions
================================================== */

const filters = {
    search: "",
    type: "",
    theme: "",
    mode: "",
    location: "",
    date: "",
    startDate: "",
    endDate: "",
    sortBy: "",
    order: "asc"
};

const sortLabels = {
    "startDateTime-asc": "Soonest first",
    "startDateTime-desc": "Farthest first",
    "title-asc": "Title A-Z",
    "title-desc": "Title Z-A"
};

const renderFilterCard = (props = {}) =>
    render(
        <EventsFilterCard
            filters={filters}
            showFilters={false}
            sortLabels={sortLabels}
            onToggleFilters={vi.fn()}
            onFilterChange={vi.fn()}
            onFilterSubmit={vi.fn((e) => e.preventDefault())}
            onSortChange={vi.fn()}
            onResetFilters={vi.fn()}
            {...props}
        />
    );

describe("EventsFilterCard", () => {
    it("renders filter header and toggle button", () => {
        renderFilterCard();

        expect(screen.getByText("Filters")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /show filters/i })).toBeInTheDocument();
    });

    it("does not render form when filters are hidden", () => {
        renderFilterCard();

        expect(screen.queryByPlaceholderText(/search events/i)).not.toBeInTheDocument();
    });

    it("renders filter form when filters are visible", () => {
        renderFilterCard({ showFilters: true });

        expect(screen.getByPlaceholderText(/search events/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/workshop, meetup/i)).toBeInTheDocument();
        expect(screen.getByText("Soonest first")).toBeInTheDocument();
    });

    it("calls onToggleFilters when toggle button is clicked", () => {
        const onToggleFilters = vi.fn();

        renderFilterCard({ onToggleFilters });

        fireEvent.click(screen.getByRole("button", { name: /show filters/i }));

        expect(onToggleFilters).toHaveBeenCalled();
    });

    it("calls onFilterChange when input changes", () => {
        const onFilterChange = vi.fn();

        renderFilterCard({
            showFilters: true,
            onFilterChange
        });

        fireEvent.change(screen.getByPlaceholderText(/search events/i), {
            target: { value: "music" }
        });

        expect(onFilterChange).toHaveBeenCalled();
    });

    it("calls onSortChange when sort select changes", () => {
        const onSortChange = vi.fn();

        renderFilterCard({
            showFilters: true,
            onSortChange
        });

        fireEvent.change(screen.getByDisplayValue("Soonest first"), {
            target: { value: "title-desc" }
        });

        expect(onSortChange).toHaveBeenCalled();
    });

    it("calls onFilterSubmit when form is submitted", () => {
        const onFilterSubmit = vi.fn((e) => e.preventDefault());

        renderFilterCard({
            showFilters: true,
            onFilterSubmit
        });

        fireEvent.click(screen.getByRole("button", { name: /apply filters/i }));

        expect(onFilterSubmit).toHaveBeenCalled();
    });

    it("calls onResetFilters when reset button is clicked", () => {
        const onResetFilters = vi.fn();

        renderFilterCard({
            showFilters: true,
            onResetFilters
        });

        fireEvent.click(screen.getByRole("button", { name: /reset/i }));

        expect(onResetFilters).toHaveBeenCalled();
    });
});
