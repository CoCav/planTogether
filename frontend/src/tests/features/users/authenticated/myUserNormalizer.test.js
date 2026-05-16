import { describe, expect, it } from "vitest";

import { getNormalizedAuthenticatedUser, normalizeAuthenticatedUser } from "../../../../features/users/authenticated/myUserNormalizer";

/* ==================================================
   MY USER NORMALIZER TESTS
   Tests authenticated user profile normalization

   Handles:
   - authenticated user normalization
   - userId/id fallback
   - profile fallback values
   - API payload extraction
================================================== */

describe("myUserNormalizer", () => {

    /* =============================
       AUTHENTICATED USER
    ============================= */

    it("should normalize authenticated user with userId", () => {
        expect(
            normalizeAuthenticatedUser({
                userId: 1,
                name: "John Doe",
                email: "john@test.com",
                avatar: "/uploads/avatars/avatar.png"
            })
        ).toEqual({
            userId: 1,
            name: "John Doe",
            email: "john@test.com",
            avatar: "/uploads/avatars/avatar.png"
        });
    });

    it("should normalize authenticated user with id fallback", () => {
        expect(
            normalizeAuthenticatedUser({
                id: 2,
                name: "Jane Doe",
                email: "jane@test.com"
            })
        ).toEqual({
            userId: 2,
            name: "Jane Doe",
            email: "jane@test.com",
            avatar: null
        });
    });

    it("should return fallback values when user is empty", () => {
        expect(normalizeAuthenticatedUser()).toEqual({
            userId: null,
            name: "",
            email: "",
            avatar: null
        });
    });

    /* =============================
       API PAYLOAD EXTRACTION
    ============================= */

    it("should extract and normalize authenticated user from API payload", () => {
        const payload = {
            data: {
                user: {
                    id: 1,
                    name: "John Doe",
                    email: "john@test.com",
                    avatar: null
                }
            }
        };

        expect(getNormalizedAuthenticatedUser(payload)).toEqual({
            userId: 1,
            name: "John Doe",
            email: "john@test.com",
            avatar: null
        });
    });
});
