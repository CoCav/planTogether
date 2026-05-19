import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import EventViewTabs from "../../../components/events/EventViewTabs";

import {
    createAllEventsView,
    createUpcomingEventsView,
    createPastEventsView
} from "../../factories/events/eventViewFactory";

/* ==================================================
   EVENT VIEW TABS TESTS
   Tests event view tab navigation

   Handles:
   - view tab rendering
   - active tab state
   - view change callback
   - accessible navigation label
================================================== */

describe("EventViewTabs", () => {

    /* =============================
       TEST DATA
    ============================= */


    const views = [
        createAllEventsView(),
        createUpcomingEventsView(),
        createPastEventsView()
    ];
    /* =============================
       TEST HELPERS
    ============================= */

    const renderEventViewTabs = (props = {}) => {
        return render(
            <EventViewTabs
                views={views}
                activeView="all"
                onChange={vi.fn()}
                {...props}
            />
        );
    };

    /* =============================
       RENDERING
    ============================= */

    it("should render event view navigation", () => {
        renderEventViewTabs();

        expect(screen.getByRole("navigation", {
            name: "Event views"
        })).toBeInTheDocument();
    });

    it("should render all view tabs", () => {
        renderEventViewTabs();

        expect(screen.getByRole("button", { name: /all/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /upcoming/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /archives/i })).toBeInTheDocument();
    });

    it("should render tab icons", () => {
        renderEventViewTabs();

        expect(screen.getByText("📋")).toBeInTheDocument();
        expect(screen.getByText("📅")).toBeInTheDocument();
        expect(screen.getByText("🗂️")).toBeInTheDocument();
    });

    /* =============================
       ACTIVE STATE
    ============================= */

    it("should mark active view tab", () => {
        renderEventViewTabs({
            activeView: "upcoming"
        });

        const activeButton = screen.getByRole("button", {
            name: /upcoming/i
        });

        expect(activeButton).toHaveClass("is-active");
        expect(activeButton).toHaveAttribute("aria-pressed", "true");
    });

    it("should mark inactive view tabs as not pressed", () => {
        renderEventViewTabs({
            activeView: "upcoming"
        });

        const inactiveButton = screen.getByRole("button", {
            name: /all/i
        });

        expect(inactiveButton).not.toHaveClass("is-active");
        expect(inactiveButton).toHaveAttribute("aria-pressed", "false");
    });

    /* =============================
       VIEW CHANGE
    ============================= */

    it("should call onChange with selected view key", () => {
        const onChange = vi.fn();

        renderEventViewTabs({
            onChange
        });

        fireEvent.click(screen.getByRole("button", {
            name: /upcoming/i
        }));

        expect(onChange).toHaveBeenCalledWith("upcoming");
    });
});
