import { describe, expect, it } from "vitest";

import { normalizeEventLike } from "../../../features/eventLikes/eventLikeNormalizer";

/* ==================================================
   EVENT LIKE NORMALIZER TESTS
   Tests event like payload normalization

   Handles:
   - event ID normalization
   - user ID normalization
   - liked state normalization
   - likes count normalization
   - fallback values

   Notes:
   - like and unlike responses share the same response shape
   - backend controls the final liked state and likes count
================================================== */

describe("eventLikeNormalizer", () => {

    /* =============================
       EVENT LIKE NORMALIZATION
    ============================= */

    it("should normalize event like payload", () => {
        const result = normalizeEventLike({
            eventId: 1,
            userId: 10,
            liked: true,
            likesCount: 4
        });

        expect(result).toEqual({
            eventId: 1,
            userId: 10,
            liked: true,
            likesCount: 4
        });
    });

    it("should normalize likes count as number", () => {
        const result = normalizeEventLike({
            likesCount: "7"
        });

        expect(result.likesCount).toBe(7);
    });

    it("should normalize liked state as boolean", () => {
        expect(normalizeEventLike({ liked: true }).liked).toBe(true);
        expect(normalizeEventLike({ liked: false }).liked).toBe(false);
        expect(normalizeEventLike({ liked: null }).liked).toBe(false);
    });

    it("should use fallback values when payload is missing", () => {
        expect(normalizeEventLike()).toEqual({
            eventId: null,
            userId: null,
            liked: false,
            likesCount: 0
        });
    });
});
