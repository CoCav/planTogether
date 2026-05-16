import { describe, expect, it } from "vitest";

import {
    getNormalizedEventStaff,
    getNormalizedMembers,
    getNormalizedMembership,
    getNormalizedOwnershipTransfer,
    normalizeMemberList,
    normalizeMembership,
    normalizeMemberships
} from "../../../features/eventMemberships/eventMembershipNormalizer";

import { EVENT_ROLES } from "../../../features/shared/eventRoles";

/* ==================================================
   EVENT MEMBERSHIP NORMALIZER TESTS
   Tests event membership payload normalization

   Handles:
   - single membership normalization
   - membership list normalization
   - member and staff list normalization
   - API payload extraction
   - ownership transfer normalization
================================================== */

describe("eventMembershipNormalizer", () => {

    /* =============================
       MEMBERSHIP NORMALIZATION
    ============================= */

    it("should normalize one membership item with nested User", () => {
        const membership = normalizeMembership({
            id: 10,
            eventId: 1,
            userId: 2,
            role: EVENT_ROLES.PARTICIPANT,
            joinedAt: "2026-01-01T10:00:00.000Z",
            createdAt: "2026-01-01T10:00:00.000Z",
            updatedAt: "2026-01-02T10:00:00.000Z",
            deletedAt: null,
            User: {
                id: 2,
                name: "John Doe",
                email: "john@test.com"
            }
        });

        expect(membership).toEqual({
            id: 10,
            eventId: 1,
            userId: 2,
            role: EVENT_ROLES.PARTICIPANT,
            joinedAt: "2026-01-01T10:00:00.000Z",
            createdAt: "2026-01-01T10:00:00.000Z",
            updatedAt: "2026-01-02T10:00:00.000Z",
            deletedAt: null,
            user: {
                id: 2,
                name: "John Doe",
                email: "john@test.com"
            }
        });
    });

    it("should normalize one membership item with lowercase user", () => {
        const membership = normalizeMembership({
            id: 11,
            eventId: 1,
            role: EVENT_ROLES.CO_ORGANIZER,
            user: {
                id: 3,
                name: "Jane Doe",
                email: "jane@test.com"
            }
        });

        expect(membership).toMatchObject({
            id: 11,
            eventId: 1,
            userId: 3,
            role: EVENT_ROLES.CO_ORGANIZER,
            user: {
                id: 3,
                name: "Jane Doe",
                email: "jane@test.com"
            }
        });
    });

    it("should return fallback values for empty membership", () => {
        expect(normalizeMembership()).toEqual({
            id: null,
            eventId: null,
            userId: null,
            role: null,
            joinedAt: null,
            createdAt: null,
            updatedAt: null,
            deletedAt: null,
            user: {
                id: null,
                name: "",
                email: ""
            }
        });
    });

    it("should normalize an array of memberships", () => {
        const memberships = normalizeMemberships([
            {
                id: 1,
                role: EVENT_ROLES.PARTICIPANT
            },
            {
                id: 2,
                role: EVENT_ROLES.CO_ORGANIZER
            }
        ]);

        expect(memberships).toHaveLength(2);
        expect(memberships[0].role).toBe(EVENT_ROLES.PARTICIPANT);
        expect(memberships[1].role).toBe(EVENT_ROLES.CO_ORGANIZER);
    });

    it("should return empty array when memberships data is invalid", () => {
        expect(normalizeMemberships(null)).toEqual([]);
        expect(normalizeMemberships({})).toEqual([]);
    });

    /* =============================
       MEMBER / STAFF LISTS
    ============================= */

    it("should normalize membership data for member and staff UI lists", () => {
        const members = normalizeMemberList([
            {
                id: 10,
                eventId: 1,
                role: EVENT_ROLES.PARTICIPANT,
                joinedAt: "2026-01-01T10:00:00.000Z",
                createdAt: "2026-01-01T10:00:00.000Z",
                updatedAt: "2026-01-02T10:00:00.000Z",
                deletedAt: null,
                User: {
                    id: 2,
                    name: "John Doe",
                    email: "john@test.com"
                }
            }
        ]);

        expect(members).toEqual([
            {
                id: 2,
                name: "John Doe",
                email: "john@test.com",
                role: EVENT_ROLES.PARTICIPANT,
                membershipId: 10,
                eventId: 1,
                joinedAt: "2026-01-01T10:00:00.000Z",
                createdAt: "2026-01-01T10:00:00.000Z",
                updatedAt: "2026-01-02T10:00:00.000Z",
                deletedAt: null
            }
        ]);
    });

    /* =============================
       API PAYLOAD EXTRACTION
    ============================= */

    it("should extract and normalize members from API payload", () => {
        const payload = {
            data: {
                members: [
                    {
                        id: 10,
                        eventId: 1,
                        role: EVENT_ROLES.PARTICIPANT,
                        User: {
                            id: 2,
                            name: "John Doe",
                            email: "john@test.com"
                        }
                    }
                ]
            }
        };

        const members = getNormalizedMembers(payload);

        expect(members).toEqual([
            expect.objectContaining({
                id: 2,
                name: "John Doe",
                email: "john@test.com",
                role: EVENT_ROLES.PARTICIPANT,
                membershipId: 10,
                eventId: 1
            })
        ]);
    });

    it("should extract and normalize event staff from API payload", () => {
        const payload = {
            data: {
                eventStaff: [
                    {
                        id: 11,
                        eventId: 1,
                        role: EVENT_ROLES.ORGANIZER,
                        User: {
                            id: 3,
                            name: "Jane Doe",
                            email: "jane@test.com"
                        }
                    }
                ]
            }
        };

        const staff = getNormalizedEventStaff(payload);

        expect(staff).toEqual([
            expect.objectContaining({
                id: 3,
                name: "Jane Doe",
                email: "jane@test.com",
                role: EVENT_ROLES.ORGANIZER,
                membershipId: 11,
                eventId: 1
            })
        ]);
    });

    it("should extract and normalize one membership from API payload", () => {
        const payload = {
            data: {
                membership: {
                    id: 12,
                    eventId: 1,
                    userId: 4,
                    role: EVENT_ROLES.PARTICIPANT
                }
            }
        };

        const membership = getNormalizedMembership(payload);

        expect(membership).toMatchObject({
            id: 12,
            eventId: 1,
            userId: 4,
            role: EVENT_ROLES.PARTICIPANT
        });
    });

    it("should extract and normalize ownership transfer result", () => {
        const payload = {
            data: {
                data: {
                    previousOrganizer: {
                        id: 20,
                        userId: 1,
                        role: EVENT_ROLES.CO_ORGANIZER
                    },
                    newOrganizer: {
                        id: 21,
                        userId: 2,
                        role: EVENT_ROLES.ORGANIZER
                    }
                }
            }
        };

        const result = getNormalizedOwnershipTransfer(payload);

        expect(result).toEqual({
            previousOrganizer: expect.objectContaining({
                id: 20,
                userId: 1,
                role: EVENT_ROLES.CO_ORGANIZER
            }),
            newOrganizer: expect.objectContaining({
                id: 21,
                userId: 2,
                role: EVENT_ROLES.ORGANIZER
            })
        });
    });
});
