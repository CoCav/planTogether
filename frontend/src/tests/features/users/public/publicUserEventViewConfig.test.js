import { describe, expect, it } from "vitest";

import {
    DEFAULT_PUBLIC_USER_EVENT_VIEW_CONTENT,
    getPublicUserEventViewContent,
    PUBLIC_USER_EVENT_VIEWS
} from "../../../../features/users/public/publicUserEventViewConfig";

/* ==================================================
   PUBLIC USER EVENT VIEW CONFIG TESTS
   Tests public user event view configuration

   Handles:
   - public user event views
   - view content resolution
   - fallback behavior
================================================== */

describe("publicUserEventViewConfig", () => {

    /* =============================
       VIEW RESOLUTION
    ============================= */

    it("should return created public user event view", () => {
        const view = getPublicUserEventViewContent("created");

        expect(view).toMatchObject({
            key: "created",
            title: "Created Events",
            defaultSortBy: "startDateTime",
            defaultOrder: "asc"
        });
    });

    it("should return joined public user event view", () => {
        const view = getPublicUserEventViewContent("joined");

        expect(view).toMatchObject({
            key: "joined",
            title: "Joined Events",
            defaultSortBy: "startDateTime",
            defaultOrder: "asc"
        });
    });

    it("should return default view when active view is unknown", () => {
        const view = getPublicUserEventViewContent("unknown");

        expect(view).toEqual(
            DEFAULT_PUBLIC_USER_EVENT_VIEW_CONTENT
        );
    });

    /* =============================
       VIEW COLLECTION
    ============================= */

    it("should expose public user event views", () => {
        expect(PUBLIC_USER_EVENT_VIEWS).toHaveLength(2);

        expect(PUBLIC_USER_EVENT_VIEWS[0]).toMatchObject({
            key: "created"
        });

        expect(PUBLIC_USER_EVENT_VIEWS[1]).toMatchObject({
            key: "joined"
        });
    });
});
