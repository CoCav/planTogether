import { describe, expect, it } from "vitest";

import {
    getNormalizedPublicUserProfile,
    normalizePublicUserProfile,
    normalizePublicUserStats
} from "../../../../features/users/public/publicUserNormalizer";

import { createPublicUser, createPublicUserStats } from "../../../factories/users/userFactory";

/* ==================================================
   PUBLIC USER NORMALIZER TESTS
   Tests public user profile payload normalization

   Handles:
   - public user stats normalization
   - public user profile normalization
   - API payload extraction
   - fallback values

   Notes:
   - uses reusable public user test factories
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
        ).toEqual(
            createPublicUserStats({
                createdEventsCount: 3,
                joinedEventsCount: 5
            })
        );
    });

    it("should return fallback public user stats", () => {
        expect(normalizePublicUserStats()).toEqual(
            createPublicUserStats({
                createdEventsCount: 0,
                joinedEventsCount: 0
            })
        );
    });

    /* =============================
       PUBLIC USER PROFILE
    ============================= */

    it("should normalize public user profile payload", () => {
        const result = normalizePublicUserProfile({
            user: createPublicUser({
                name: "John Doe",
                avatar: "/uploads/avatars/avatar.png"
            }),

            stats: {
                createdEventsCount: "2",
                joinedEventsCount: "4"
            },

            message: "Public profile retrieved",
            success: true
        });

        expect(result).toEqual({
            user: createPublicUser({
                name: "John Doe",
                avatar: "/uploads/avatars/avatar.png"
            }),

            stats: createPublicUserStats({
                createdEventsCount: 2,
                joinedEventsCount: 4
            }),

            message: "Public profile retrieved",
            success: true
        });
    });

    it("should return fallback public user profile values", () => {
        expect(normalizePublicUserProfile()).toEqual({
            user: createPublicUser({
                name: "",
                avatar: null
            }),

            stats: createPublicUserStats({
                createdEventsCount: 0,
                joinedEventsCount: 0
            }),

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
                user: createPublicUser({
                    name: "Jane Doe",
                    avatar: null
                }),

                stats: createPublicUserStats({
                    createdEventsCount: 1,
                    joinedEventsCount: 3
                }),

                message: "Public profile retrieved",
                success: true
            }
        };

        expect(getNormalizedPublicUserProfile(payload)).toEqual({
            user: createPublicUser({
                name: "Jane Doe",
                avatar: null
            }),

            stats: createPublicUserStats({
                createdEventsCount: 1,
                joinedEventsCount: 3
            }),

            message: "",
            success: false
        });
    });
});
