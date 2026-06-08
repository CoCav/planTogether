import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventViewTabs from "../../../components/events/EventViewTabs";

import { EVENT_STATUS } from "../../../features/shared/constants/eventStatus";

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
   - mobile scroll wrapper
   - accessible tab navigation
   - view change callback
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

    it("should render event view tablist", () => {
        renderEventViewTabs();

        expect(screen.getByRole("tablist", {
            name: "Event views"
        })).toBeInTheDocument();
    });

    it("should render horizontal scroll wrapper", () => {
        renderEventViewTabs();

        expect(document.querySelector(".event-view-tabs-scroll")).toBeInTheDocument();
    });

    it("should render all view tabs", () => {
        renderEventViewTabs();

        expect(screen.getByRole("tab", { name: /all/i })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: /upcoming/i })).toBeInTheDocument();
        expect(screen.getByRole("tab", { name: /archives/i })).toBeInTheDocument();
    });

    it("should hide decorative tab icons from assistive technologies", () => {
        renderEventViewTabs();

        const icons = document.querySelectorAll(".event-view-tab-icon[aria-hidden='true']");

        expect(icons).toHaveLength(3);
    });

    /* =============================
       ACTIVE STATE
    ============================= */

    it("should mark active view tab", () => {
        renderEventViewTabs({
            activeView: EVENT_STATUS.UPCOMING
        });

        const activeTab = screen.getByRole("tab", {
            name: /upcoming/i
        });

        expect(activeTab).toHaveClass("is-active");
        expect(activeTab).toHaveAttribute("aria-selected", "true");
        expect(activeTab).toHaveAttribute("tabindex", "0");
    });

    it("should mark inactive view tabs as not selected", () => {
        renderEventViewTabs({
            activeView: EVENT_STATUS.UPCOMING
        });

        const inactiveTab = screen.getByRole("tab", {
            name: /all/i
        });

        expect(inactiveTab).not.toHaveClass("is-active");
        expect(inactiveTab).toHaveAttribute("aria-selected", "false");
        expect(inactiveTab).toHaveAttribute("tabindex", "-1");
    });

    /* =============================
       VIEW CHANGE
    ============================= */

    it("should call onChange with selected view key", () => {
        const onChange = vi.fn();

        renderEventViewTabs({
            onChange
        });

        fireEvent.click(screen.getByRole("tab", {
            name: /upcoming/i
        }));

        expect(onChange).toHaveBeenCalledWith(EVENT_STATUS.UPCOMING);
    });
});
