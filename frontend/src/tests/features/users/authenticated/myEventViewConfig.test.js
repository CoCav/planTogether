import { describe, expect, it } from "vitest";

import {
    DEFAULT_MY_EVENT_VIEW_CONTENT,
    MY_EVENT_VIEWS,
    getMyEventViewContent
} from "../../../../features/users/authenticated/myEventViewConfig";

import {
    createCreatedEventsView,
    createCreatedHistoryView,
    createDefaultMyEventView,
    createJoinedEventsView,
    createJoinedHistoryView
} from "../../../factories/users/authenticated/myEventViewFactory";

/* ==================================================
   MY EVENT VIEW CONFIG TESTS
   Tests current user event view configuration

   Handles:
   - current user event view definitions
   - view content resolution
   - default view fallback
   - sorting and quick filter defaults

   Notes:
   - uses reusable current user event view factories
================================================== */

describe("myEventViewConfig", () => {

    /* =============================
       CURRENT USER EVENT VIEWS
    ============================= */

    it("should expose current user event views", () => {
        expect(MY_EVENT_VIEWS).toHaveLength(4);

        expect(MY_EVENT_VIEWS.map((view) => view.key)).toEqual([
            "created",
            "createdHistory",
            "joined",
            "joinedHistory"
        ]);
    });

    it("should return created events view content", () => {
        const view = getMyEventViewContent("created");

        expect(view).toMatchObject(createCreatedEventsView());
    });

    it("should return created history view content", () => {
        const view = getMyEventViewContent("createdHistory");

        expect(view).toMatchObject(createCreatedHistoryView());
    });

    it("should return joined events view content", () => {
        const view = getMyEventViewContent("joined");

        expect(view).toMatchObject(createJoinedEventsView());
    });

    it("should return joined history view content", () => {
        const view = getMyEventViewContent("joinedHistory");

        expect(view).toMatchObject(createJoinedHistoryView());
    });

    /* =============================
       DEFAULT VIEW
    ============================= */

    it("should return default view when active view is unknown", () => {
        const view = getMyEventViewContent("unknown");

        expect(view).toEqual(DEFAULT_MY_EVENT_VIEW_CONTENT);
        expect(view).toEqual(createDefaultMyEventView());
    });
});
