import { EVENT_ROLES } from "../../../features/shared/eventRoles";

import { createAuthenticatedUser } from "../users/userFactory";

/* ==================================================
   EVENT MEMBERSHIP TEST FACTORY

   Handles:
   - membership generation
   - normalized member list generation
   - ownership transfer payload generation

   Notes:
   - shared across frontend unit and component tests
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   MEMBERSHIPS
============================= */

// Generate a normalized membership object
export const createMembership = (overrides = {}) => ({
    id: 1,

    eventId: 1,
    userId: 1,

    role: EVENT_ROLES.PARTICIPANT,

    joinedAt: "2026-01-01T10:00:00.000Z",

    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-02T10:00:00.000Z",

    deletedAt: null,

    user: {
        id: 1,
        name: "John Doe",
        email: "john@test.com"
    },

    ...overrides
});

/* =============================
   MEMBER LISTS
============================= */

// Generate a normalized member list item
export const createMemberListItem = (overrides = {}) => ({
    id: 1,

    name: "John Doe",
    email: "john@test.com",

    role: EVENT_ROLES.PARTICIPANT,

    membershipId: 1,
    eventId: 1,

    joinedAt: "2026-01-01T10:00:00.000Z",

    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-02T10:00:00.000Z",

    deletedAt: null,

    ...overrides
});

/* =============================
   OWNERSHIP TRANSFER
============================= */

// Generate an ownership transfer payload
export const createOwnershipTransferPayload = (overrides = {}) => ({
    previousOrganizer: createMembership({
        role: EVENT_ROLES.ORGANIZER
    }),

    newOrganizer: createMembership({
        userId: 2,

        role: EVENT_ROLES.ORGANIZER,

        user: createAuthenticatedUser({
            userId: 2,
            name: "Jane Doe",
            email: "jane@test.com"
        })
    }),

    ...overrides
});
