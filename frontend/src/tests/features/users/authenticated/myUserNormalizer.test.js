import { describe, expect, it } from "vitest";

import {
    getNormalizedAuthenticatedUser,
    normalizeAuthenticatedUser
} from "../../../../features/users/authenticated/myUserNormalizer";

import { createAuthenticatedUser } from "../../../factories/users/userFactory";

/* ==================================================
   MY USER NORMALIZER TESTS
   Tests authenticated user profile normalization

   Handles:
   - authenticated user normalization
   - userId/id fallback
   - profile fallback values
   - API payload extraction

   Notes:
   - uses reusable user test factories
================================================== */

describe("myUserNormalizer", () => {

    /* =============================
       AUTHENTICATED USER
    ============================= */

    it("should normalize authenticated user with userId", () => {
        const user = createAuthenticatedUser({
            userId: 1,
            name: "John Doe",
            email: "john@test.com",
            avatar: "/uploads/avatars/avatar.png"
        });

        expect(normalizeAuthenticatedUser(user)).toEqual(user);
    });

    it("should normalize authenticated user with id fallback", () => {
        expect(
            normalizeAuthenticatedUser({
                id: 2,
                name: "Jane Doe",
                email: "jane@test.com"
            })
        ).toEqual(
            createAuthenticatedUser({
                userId: 2,
                name: "Jane Doe",
                email: "jane@test.com",
                avatar: null
            })
        );
    });

    it("should return fallback values when user is empty", () => {
        expect(normalizeAuthenticatedUser()).toEqual(
            createAuthenticatedUser({
                userId: null,
                name: "",
                email: "",
                avatar: null
            })
        );
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

        expect(getNormalizedAuthenticatedUser(payload)).toEqual(
            createAuthenticatedUser({
                userId: 1,
                name: "John Doe",
                email: "john@test.com",
                avatar: null
            })
        );
    });
});
