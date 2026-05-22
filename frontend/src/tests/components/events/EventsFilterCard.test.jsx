import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventsFilterCard from "../../../components/events/EventsFilterCard";

import { EVENT_MODES, getEventModeLabel } from "../../../features/shared/constants/eventModes";

import { createEventListingFilters } from "../../factories/shared/eventListingFiltersFactory";

/* ==================================================
   EVENTS FILTER CARD TESTS
   Tests event listing filter form rendering and interactions

   Handles:
   - filter card header rendering
   - filter visibility toggle
   - hidden and visible form states
   - accessible form labels and descriptions
   - accessible live results count
   - text filter changes
   - mode filter changes
   - date filter controls
   - disabled date range fields
   - sort changes
   - filter submission
   - filter reset

   Notes:
   - uses reusable filter props
   - focuses on form visibility and callbacks
================================================== */

describe("EventsFilterCard", () => {

    /* =============================
       TEST DATA
    ============================= */

    const filters = createEventListingFilters();

    const sortLabels = {
        "startDateTime-asc": "Soonest first",
        "startDateTime-desc": "Farthest first",
        "title-asc": "Title A-Z",
        "title-desc": "Title Z-A"
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderFilterCard = (props = {}) => {
        return render(
            <EventsFilterCard
                filters={filters}
                showFilters={false}
                sortLabels={sortLabels}
                onToggleFilters={vi.fn()}
                onFilterChange={vi.fn()}
                onFilterSubmit={vi.fn((e) => e.preventDefault())}
                onSortChange={vi.fn()}
                resultsCount={42}
                onResetFilters={vi.fn()}
                {...props}
            />
        );
    };

    /* =============================
       FILTER CARD HEADER
    ============================= */

    it("renders filter header and toggle button", () => {
        renderFilterCard();

        expect(screen.getByText("Filters")).toBeInTheDocument();

        expect(screen.getByRole("button", {
            name: /show filters/i
        })).toBeInTheDocument();
    });

    it("renders results count", () => {
        renderFilterCard({
            resultsCount: 42
        });

        expect(screen.getByText(/42 events found/i)).toBeInTheDocument();
    });

    it("announces results count politely", () => {
        renderFilterCard({
            resultsCount: 42
        });

        expect(screen.getByText(/42 events found/i)).toHaveAttribute(
            "aria-live",
            "polite"
        );
    });

    it("calls onToggleFilters when toggle button is clicked", () => {
        const onToggleFilters = vi.fn();

        renderFilterCard({ onToggleFilters });

        fireEvent.click(screen.getByRole("button", {
            name: /show filters/i
        }));

        expect(onToggleFilters).toHaveBeenCalled();
    });

    /* =============================
       FILTER FORM VISIBILITY
    ============================= */

    it("does not render form when filters are hidden", () => {
        renderFilterCard();

        expect(screen.queryByPlaceholderText(/search events/i)).not.toBeInTheDocument();
    });

    it("renders filter form when filters are visible", () => {
        renderFilterCard({
            showFilters: true
        });

        expect(screen.getByLabelText(/^search$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^creator$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^type$/i)).toBeInTheDocument();

        expect(screen.getByText("Soonest first")).toBeInTheDocument();
    });

    it("associates visible filter controls with their labels", () => {
        renderFilterCard({
            showFilters: true
        });

        expect(screen.getByLabelText(/^search$/i)).toHaveAttribute("id", "event-filter-search");
        expect(screen.getByLabelText(/^sort by$/i)).toHaveAttribute("id", "event-filter-sort-by");
    });

    it("keeps filter form labelled by its title", () => {
        renderFilterCard({
            showFilters: true
        });

        expect(screen.getByRole("form")).toHaveAttribute("aria-labelledby", "events-filters-title");
    });

    /* =============================
       FILTER FIELD CHANGES
    ============================= */

    it("calls onFilterChange when search input changes", () => {
        const onFilterChange = vi.fn();

        renderFilterCard({
            showFilters: true,
            onFilterChange
        });

        fireEvent.change(screen.getByLabelText(/^search$/i), {
            target: {
                value: "music"
            }
        });

        expect(onFilterChange).toHaveBeenCalled();
    });

    it("calls onFilterChange when creator input changes", () => {
        const onFilterChange = vi.fn();

        renderFilterCard({
            showFilters: true,
            onFilterChange
        });

        fireEvent.change(screen.getByLabelText(/^creator$/i), {
            target: {
                value: "john"
            }
        });

        expect(onFilterChange).toHaveBeenCalled();
    });

    it("calls onFilterChange when date input changes", () => {
        const onFilterChange = vi.fn();

        renderFilterCard({
            showFilters: true,
            onFilterChange
        });

        fireEvent.change(screen.getByLabelText(/^date$/i), {
            target: {
                value: "2026-05-18"
            }
        });

        expect(onFilterChange).toHaveBeenCalled();
    });

    /* =============================
       MODE FILTER
    ============================= */

    it("renders available event modes", () => {
        renderFilterCard({
            showFilters: true
        });

        expect(
            screen.getByRole("option", {
                name: getEventModeLabel(EVENT_MODES.ONLINE)
            })
        ).toHaveValue(EVENT_MODES.ONLINE);

        expect(
            screen.getByRole("option", {
                name: getEventModeLabel(EVENT_MODES.IN_PERSON)
            })
        ).toHaveValue(EVENT_MODES.IN_PERSON);
    });

    it("calls onFilterChange when mode select changes", () => {
        const onFilterChange = vi.fn();

        renderFilterCard({
            showFilters: true,
            onFilterChange
        });

        fireEvent.change(screen.getByLabelText(/mode/i), {
            target: {
                value: EVENT_MODES.ONLINE
            }
        });

        expect(onFilterChange).toHaveBeenCalled();
    });

    /* =============================
       DATE RANGE STATE
    ============================= */

    it("disables start and end date fields when exact date is selected", () => {
        renderFilterCard({
            showFilters: true,
            filters: {
                ...filters,
                date: "2026-05-18"
            }
        });

        expect(screen.getByLabelText(/start date/i)).toBeDisabled();
        expect(screen.getByLabelText(/end date/i)).toBeDisabled();
    });

    it("keeps start and end date fields enabled when exact date is empty", () => {
        renderFilterCard({
            showFilters: true
        });

        expect(screen.getByLabelText(/start date/i)).not.toBeDisabled();
        expect(screen.getByLabelText(/end date/i)).not.toBeDisabled();
    });

    /* =============================
       SORTING
    ============================= */

    it("calls onSortChange when sort select changes", () => {
        const onSortChange = vi.fn();

        renderFilterCard({
            showFilters: true,
            onSortChange
        });

        fireEvent.change(screen.getByLabelText(/sort by/i), {
            target: {
                value: "title-desc"
            }
        });

        expect(onSortChange).toHaveBeenCalled();
    });

    /* =============================
       FILTER FORM ACTIONS
    ============================= */

    it("calls onFilterSubmit when form is submitted", () => {
        const onFilterSubmit = vi.fn((e) => e.preventDefault());

        renderFilterCard({
            showFilters: true,
            onFilterSubmit
        });

        fireEvent.click(screen.getByRole("button", {
            name: /apply filters/i
        }));

        expect(onFilterSubmit).toHaveBeenCalled();
    });

    it("calls onResetFilters when reset button is clicked", () => {
        const onResetFilters = vi.fn();

        renderFilterCard({
            showFilters: true,
            onResetFilters
        });

        fireEvent.click(screen.getByRole("button", {
            name: /reset/i
        }));

        expect(onResetFilters).toHaveBeenCalled();
    });
});
