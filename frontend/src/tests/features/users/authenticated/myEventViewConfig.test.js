import { describe, expect, it } from "vitest";

import {
    DEFAULT_MY_EVENT_VIEW_CONTENT,
    MY_EVENT_VIEWS,
    getMyEventViewContent
} from "../../../../features/users/authenticated/myEventViewConfig";

/* ==================================================
   MY EVENT VIEW CONFIG TESTS
   Tests current user event view configuration

   Handles:
   - current user event view definitions
   - view content resolution
   - default view fallback
   - sorting and quick filter defaults
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

        expect(view).toMatchObject({
            key: "created",
            label: "Created",
            defaultSortBy: "startDateTime",
            defaultOrder: "asc",
            showQuickActions: true,
            clearDateFiltersOnEnter: false
        });
    });

    it("should return created history view content", () => {
        const view = getMyEventViewContent("createdHistory");

        expect(view).toMatchObject({
            key: "createdHistory",
            label: "Created History",
            defaultSortBy: "startDateTime",
            defaultOrder: "desc",
            showQuickActions: false,
            clearDateFiltersOnEnter: true
        });
    });

    it("should return joined events view content", () => {
        const view = getMyEventViewContent("joined");

        expect(view).toMatchObject({
            key: "joined",
            label: "Joined",
            defaultSortBy: "startDateTime",
            defaultOrder: "asc",
            showQuickActions: true,
            clearDateFiltersOnEnter: false
        });
    });

    it("should return joined history view content", () => {
        const view = getMyEventViewContent("joinedHistory");

        expect(view).toMatchObject({
            key: "joinedHistory",
            label: "Joined History",
            defaultSortBy: "startDateTime",
            defaultOrder: "desc",
            showQuickActions: false,
            clearDateFiltersOnEnter: true
        });
    });

    /* =============================
       DEFAULT VIEW
    ============================= */

    it("should return default view when active view is unknown", () => {
        const view = getMyEventViewContent("unknown");

        expect(view).toEqual(DEFAULT_MY_EVENT_VIEW_CONTENT);
    });
});
