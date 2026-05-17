import { describe, expect, it } from "vitest";

import {
    DEFAULT_PUBLIC_USER_EVENT_VIEW_CONTENT,
    PUBLIC_USER_EVENT_VIEWS,
    getPublicUserEventViewContent
} from "../../../../features/users/public/publicUserEventViewConfig";

import {
    createDefaultPublicUserEventView,
    createPublicUserCreatedEventsView,
    createPublicUserJoinedEventsView
} from "../../../factories/users/public/publicUserEventViewFactory";

/* ==================================================
   PUBLIC USER EVENT VIEW CONFIG TESTS
   Tests public user event view configuration

   Handles:
   - public user event views
   - view content resolution
   - fallback behavior

   Notes:
   - uses reusable public user event view factories
================================================== */

describe("publicUserEventViewConfig", () => {

    /* =============================
       VIEW RESOLUTION
    ============================= */

    it("should return created public user event view", () => {
        const view = getPublicUserEventViewContent("created");

        expect(view).toMatchObject(createPublicUserCreatedEventsView());
    });

    it("should return joined public user event view", () => {
        const view = getPublicUserEventViewContent("joined");

        expect(view).toMatchObject(createPublicUserJoinedEventsView());
    });

    it("should return default view when active view is unknown", () => {
        const view = getPublicUserEventViewContent("unknown");

        expect(view).toEqual(DEFAULT_PUBLIC_USER_EVENT_VIEW_CONTENT);
        expect(view).toEqual(createDefaultPublicUserEventView());
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
