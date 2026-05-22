import { describe, expect, it } from "vitest";

import {
    DEFAULT_EVENT_VIEW_CONTENT,
    PUBLIC_EVENT_VIEWS,
    getEventViewContent
} from "../../../features/events/eventViewConfig";

import { EVENT_STATUS } from "../../../features/shared/constants/eventStatus";

import {
    createAllEventsView,
    createDefaultEventView,
    createPastEventsView,
    createUpcomingEventsView
} from "../../factories/events/eventViewFactory";

/* ==================================================
   EVENT VIEW CONFIG TESTS
   Tests public event view configuration

   Handles:
   - public event view definitions
   - view content resolution
   - default view fallback
   - public view sorting defaults

   Notes:
   - uses reusable event view factories
================================================== */

describe("eventViewConfig", () => {

    /* =============================
       PUBLIC EVENT VIEWS
    ============================= */

    it("should expose public event views", () => {
        expect(PUBLIC_EVENT_VIEWS).toHaveLength(3);

        expect(PUBLIC_EVENT_VIEWS.map((view) => view.key)).toEqual([
            "all",
            EVENT_STATUS.UPCOMING,
            EVENT_STATUS.PAST
        ]);
    });

    it("should return all events view content", () => {
        const view = getEventViewContent("all");

        expect(view).toMatchObject(createAllEventsView());
    });

    it("should return upcoming events view content", () => {
        const view = getEventViewContent(EVENT_STATUS.UPCOMING);

        expect(view).toMatchObject(createUpcomingEventsView());
    });

    it("should return past events view content as archives", () => {
        const view = getEventViewContent(EVENT_STATUS.PAST);

        expect(view).toMatchObject(createPastEventsView());
    });

    /* =============================
       DEFAULT VIEW
    ============================= */

    it("should return default view when active view is unknown", () => {
        const view = getEventViewContent("unknown");

        expect(view).toEqual(DEFAULT_EVENT_VIEW_CONTENT);
        expect(view).toEqual(createDefaultEventView());
    });
});
