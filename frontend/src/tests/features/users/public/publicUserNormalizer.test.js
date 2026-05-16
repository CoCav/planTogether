import { describe, expect, it } from "vitest";

import {
    getNormalizedPublicUserProfile,
    normalizePublicUserProfile,
    normalizePublicUserStats
} from "../../../../features/users/public/publicUserNormalizer";

/* ==================================================
   PUBLIC USER NORMALIZER TESTS
   Tests public user profile payload normalization

   Handles:
   - public user stats normalization
   - public user profile normalization
   - API payload extraction
   - fallback values
================================================== */

describe("publicUserNormalizer", () => {

    /* =============================
       PUBLIC USER STATS
    ============================= */

    it("should normalize public user stats", () => {
        expect(
            normalizePublicUserStats({
                createdEventsCount: "3",
                joinedEventsCount: "5"
            })
        ).toEqual({
            createdEventsCount: 3,
            joinedEventsCount: 5
        });
    });

    it("should return fallback public user stats", () => {
        expect(normalizePublicUserStats()).toEqual({
            createdEventsCount: 0,
            joinedEventsCount: 0
        });
    });

    /* =============================
       PUBLIC USER PROFILE
    ============================= */

    it("should normalize public user profile payload", () => {
        const result = normalizePublicUserProfile({
            user: {
                name: "John Doe",
                avatar: "/uploads/avatars/avatar.png"
            },
            stats: {
                createdEventsCount: "2",
                joinedEventsCount: "4"
            },
            message: "Public profile retrieved",
            success: true
        });

        expect(result).toEqual({
            user: {
                name: "John Doe",
                avatar: "/uploads/avatars/avatar.png"
            },
            stats: {
                createdEventsCount: 2,
                joinedEventsCount: 4
            },
            message: "Public profile retrieved",
            success: true
        });
    });

    it("should return fallback public user profile values", () => {
        expect(normalizePublicUserProfile()).toEqual({
            user: {
                name: "",
                avatar: null
            },
            stats: {
                createdEventsCount: 0,
                joinedEventsCount: 0
            },
            message: "",
            success: false
        });
    });

    /* =============================
       API PAYLOAD EXTRACTION
    ============================= */

    it("should extract and normalize public user profile from API payload", () => {
        const payload = {
            data: {
                user: {
                    name: "Jane Doe",
                    avatar: null
                },
                stats: {
                    createdEventsCount: 1,
                    joinedEventsCount: 3
                },
                message: "Public profile retrieved",
                success: true
            }
        };

        expect(getNormalizedPublicUserProfile(payload)).toEqual({
            user: {
                name: "Jane Doe",
                avatar: null
            },
            stats: {
                createdEventsCount: 1,
                joinedEventsCount: 3
            },
            message: "",
            success: false
        });
    });
});
