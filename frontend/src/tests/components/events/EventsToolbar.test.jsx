import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventsToolbar from "../../../components/events/EventsToolbar";

import { EVENT_STATUS } from "../../../features/shared/constants/eventStatus";

import {
    createAllEventsView,
    createUpcomingEventsView,
    createPastEventsView
} from "../../factories/events/eventViewFactory";

/* ==================================================
   EVENTS TOOLBAR TESTS
   Tests event results heading and controls

   Handles:
   - results title and subtitle rendering
   - optional total event count display
   - pagination info display
   - accessible live results metadata
   - view tab integration
   - quick date filter visibility
   - quick filter button group
   - quick date filter callbacks
   - active quick filter state
   - decorative quick filter icons
================================================== */

describe("EventsToolbar", () => {

    /* =============================
       TEST DATA
    ============================= */

    const allView = createAllEventsView();
    const upcomingView = createUpcomingEventsView();
    const pastView = createPastEventsView();

    const views = [
        allView,
        upcomingView,
        pastView
    ];

    const baseProps = {
        titleId: "events-results-title",
        title: upcomingView.title,
        subtitle: upcomingView.subtitle,
        totalEvents: 12,

        page: 2,
        totalPages: 4,
        showPaginationInfo: true,

        views,
        activeView: allView.key,
        showQuickActions: true,

        filters: {
            date: "",
            startDate: "",
            endDate: ""
        },
        isCurrentWeekendFilterActive: vi.fn(() => false),

        onViewChange: vi.fn(),
        onTodayFilter: vi.fn(),
        onWeekendFilter: vi.fn()
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderEventsToolbar = (props = {}) => {
        return render(
            <EventsToolbar
                {...baseProps}
                {...props}
            />
        );
    };

    /* =============================
       RESULTS HEADING
    ============================= */

    it("should render results title, subtitle and count", () => {
        renderEventsToolbar();

        expect(
            screen.getByRole("heading", {
                level: 2,
                name: /upcoming events/i
            })
        ).toBeInTheDocument();

        expect(screen.getByText("(12)")).toBeInTheDocument();
        expect(screen.getByText("Discover upcoming events and plan ahead.")).toBeInTheDocument();
    });

    it("should not render results count when totalEvents is missing", () => {
        const { container } = renderEventsToolbar({
            totalEvents: null
        });

        expect(container.querySelector(".events-results-count")).not.toBeInTheDocument();
    });

    it("should apply accessible title id to heading", () => {
        renderEventsToolbar();

        expect(
            screen.getByRole("heading", {
                level: 2,
                name: /upcoming events/i
            })
        ).toHaveAttribute("id", "events-results-title");
    });

    it("should render pagination info when enabled", () => {
        renderEventsToolbar();

        expect(screen.getByText(/page 2 of 4/i)).toBeInTheDocument();
    });

    it("should announce results count and pagination info politely", () => {
        renderEventsToolbar();

        expect(screen.getByText("(12)")).toHaveAttribute("aria-live", "polite");

        expect(screen.getByText(/page 2 of 4/i)).toHaveAttribute("aria-live", "polite");
    });

    it("should hide pagination info when disabled", () => {
        renderEventsToolbar({
            showPaginationInfo: false
        });

        expect(screen.queryByText(/page 2 of 4/i)).not.toBeInTheDocument();
    });

    /* =============================
       VIEW TABS
    ============================= */

    it("should render event view tabs", () => {
        renderEventsToolbar();

        expect(screen.getByRole("tablist", {
            name: "Event views"
        })).toBeInTheDocument();

        expect(screen.getByRole("tab", { name: /all/i })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: /upcoming/i })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: /archives/i })).toBeInTheDocument();
    });

    it("should call onViewChange when view tab is clicked", () => {
        const onViewChange = vi.fn();

        renderEventsToolbar({
            onViewChange
        });

        fireEvent.click(screen.getByRole("tab", {
            name: /upcoming/i
        }));

        expect(onViewChange).toHaveBeenCalledWith(EVENT_STATUS.UPCOMING);
    });

    /* =============================
       QUICK ACTIONS
    ============================= */

    it("should render quick date filters when enabled", () => {
        renderEventsToolbar();

        expect(screen.getByRole("button", {
            name: "Today"
        })).toBeInTheDocument();

        expect(screen.getByRole("button", {
            name: "This Weekend"
        })).toBeInTheDocument();
    });

    it("should group quick date filters accessibly", () => {
        renderEventsToolbar();

        expect(screen.getByRole("group", {
            name: /quick event filters/i
        })).toBeInTheDocument();
    });

    it("should hide quick date filters when disabled", () => {
        renderEventsToolbar({
            showQuickActions: false
        });

        expect(screen.queryByRole("button", {
            name: "Today"
        })).not.toBeInTheDocument();

        expect(screen.queryByRole("button", {
            name: "This Weekend"
        })).not.toBeInTheDocument();
    });

    it("should call onTodayFilter when Today is clicked", () => {
        const onTodayFilter = vi.fn();

        renderEventsToolbar({
            onTodayFilter
        });

        fireEvent.click(screen.getByRole("button", {
            name: "Today"
        }));

        expect(onTodayFilter).toHaveBeenCalled();
    });

    it("should call onWeekendFilter when This Weekend is clicked", () => {
        const onWeekendFilter = vi.fn();

        renderEventsToolbar({
            onWeekendFilter
        });

        fireEvent.click(screen.getByRole("button", {
            name: "This Weekend"
        }));

        expect(onWeekendFilter).toHaveBeenCalled();
    });

    it("should mark Today quick filter as active when date filter exists", () => {
        renderEventsToolbar({
            filters: {
                date: "2026-05-19",
                startDate: "",
                endDate: ""
            }
        });

        expect(screen.getByRole("button", {
            name: "Today"
        })).toHaveClass("btn-filter-active");
    });

    it("should keep Today quick filter inactive when date filter is empty", () => {
        renderEventsToolbar();

        expect(screen.getByRole("button", {
            name: "Today"
        })).not.toHaveClass("btn-filter-active");
    });

    it("should mark This Weekend quick filter as active when weekend filter is active", () => {
        renderEventsToolbar({
            isCurrentWeekendFilterActive: vi.fn(() => true)
        });

        expect(screen.getByRole("button", {
            name: "This Weekend"
        })).toHaveClass("btn-filter-active");
    });
});
