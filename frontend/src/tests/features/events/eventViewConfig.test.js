import { describe, expect, it } from "vitest";
import { DEFAULT_VIEW_CONTENT, PUBLIC_EVENT_VIEWS, MY_EVENT_VIEWS, getViewContent } from "../../../features/events/eventViewConfig";

/* ==================================================
   EVENT VIEW CONFIG TESTS
   Tests event view configuration and resolution
================================================== */

describe("eventViewConfig", () => {

    it("returns public view content by key", () => {
        const view = getViewContent(PUBLIC_EVENT_VIEWS, "archives");

        expect(view).toMatchObject({
            key: "archives",
            status: "past",
            defaultOrder: "desc",
            showQuickActions: false
        });
    });

    it("returns my events view content by key", () => {
        const view = getViewContent(MY_EVENT_VIEWS, "createdHistory");

        expect(view).toMatchObject({
            key: "createdHistory",
            defaultSortBy: "startDateTime",
            defaultOrder: "desc",
            showQuickActions: false,
            clearDateFiltersOnEnter: true
        });
    });

    it("returns default view when active view is unknown", () => {
        const view = getViewContent(MY_EVENT_VIEWS, "unknown");

        expect(view).toEqual(DEFAULT_VIEW_CONTENT);
    });

    it("returns default view when views array is empty", () => {
        const view = getViewContent([], "any");

        expect(view).toEqual(DEFAULT_VIEW_CONTENT);
    });

    it("returns correct default sorting for upcoming public events", () => {
        const view = getViewContent(PUBLIC_EVENT_VIEWS, "upcoming");

        expect(view).toMatchObject({
            key: "upcoming",
            defaultSortBy: "startDateTime",
            defaultOrder: "asc"
        });
    });

});
