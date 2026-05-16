import { describe, expect, it } from "vitest";

import { getNormalizedAuthPayload, normalizeAuthPayload } from "../../../features/auth/authNormalizer";

/* ==================================================
   AUTH NORMALIZER TESTS
   Tests auth payload normalization

   Handles:
   - register/login payload normalization
   - authenticated user normalization
   - token extraction
   - fallback values
================================================== */

describe("authNormalizer", () => {

    /* =============================
       NORMALIZE AUTH PAYLOAD
    ============================= */

    it("should normalize auth payload", () => {
        const payload = {
            success: true,
            message: "Login successful",
            user: {
                id: 1,
                name: "John Doe"
            },
            token: "jwt-token"
        };

        const result = normalizeAuthPayload(payload);

        expect(result).toEqual({
            user: {
                userId: 1,
                name: "John Doe",
                email: "",
                avatar: null
            },
            token: "jwt-token",
            message: "Login successful",
            success: true
        });
    });

    it("should return fallback values when payload is empty", () => {
        const result = normalizeAuthPayload();

        expect(result).toEqual({
            user: {
                userId: null,
                name: "",
                email: "",
                avatar: null
            },
            token: undefined,
            message: "",
            success: false
        });
    });

    /* =============================
       GET NORMALIZED AUTH PAYLOAD
    ============================= */

    it("should normalize auth payload through helper", () => {
        const payload = {
            success: true,
            user: {
                id: 2,
                name: "John Doe"
            },
            token: "token"
        };

        const result = getNormalizedAuthPayload(payload);

        expect(result).toEqual({
            user: {
                userId: 2,
                name: "John Doe",
                email: "",
                avatar: null
            },
            token: "token",
            message: "",
            success: true
        });
    });
});
