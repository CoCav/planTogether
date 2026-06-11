import { EVENT_ROLES } from "../../../features/shared/constants/eventRoles";

/* ==================================================
   EVENT MEMBERSHIP TEST FACTORY

   Handles:
   - membership user generation
   - membership generation
   - membership list generation
   - normalized member list generation
   - API payload generation
   - ownership transfer payload generation

   Notes:
   - shared across frontend unit and component tests
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   MEMBERSHIP USERS
============================= */

// Generate a membership user object
export const createMembershipUser = (overrides = {}) => ({
    id: 1,
    name: "John Doe",
    email: "john@test.com",
    avatar: "/uploads/avatars/john.png",

    ...overrides
});

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

    user: createMembershipUser(),

    ...overrides
});

// Generate an API membership object with nested User alias
export const createApiMembership = (overrides = {}) => ({
    id: 1,

    eventId: 1,
    userId: 1,

    role: EVENT_ROLES.PARTICIPANT,

    joinedAt: "2026-01-01T10:00:00.000Z",

    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-02T10:00:00.000Z",

    deletedAt: null,

    User: createMembershipUser(),

    ...overrides
});

// Generate a list of membership objects
export const createMembershipList = (
    memberships = [createMembership()]
) => memberships;

/* =============================
   MEMBER LISTS
============================= */

// Generate a normalized member list item
export const createMemberListItem = (overrides = {}) => ({
    id: 1,

    name: "John Doe",
    email: "john@test.com",
    avatar: "/uploads/avatars/john.png",

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
   API PAYLOADS
============================= */

// Generate a members API payload
export const createMembersPayload = (overrides = {}) => ({
    members: [
        createApiMembership()
    ],

    ...overrides
});

// Generate an event staff API payload
export const createEventStaffPayload = (overrides = {}) => ({
    eventStaff: [
        createApiMembership({
            role: EVENT_ROLES.ORGANIZER
        })
    ],

    ...overrides
});

// Generate a single membership API payload
export const createMembershipPayload = (overrides = {}) => ({
    membership: createMembership(),

    ...overrides
});

/* =============================
   OWNERSHIP TRANSFER
============================= */

// Generate an ownership transfer payload
export const createOwnershipTransferPayload = (overrides = {}) => ({
    previousOrganizer: createMembership({
        role: EVENT_ROLES.CO_ORGANIZER
    }),

    newOrganizer: createMembership({
        userId: 2,

        role: EVENT_ROLES.ORGANIZER,

        user: createMembershipUser({
            id: 2,
            name: "Jane Doe",
            email: "jane@test.com",
            avatar: "/uploads/avatars/jane.png"
        })
    }),

    ...overrides
});

// Generate an ownership transfer API payload
export const createOwnershipTransferApiPayload = (overrides = {}) => ({
    data: createOwnershipTransferPayload(),

    ...overrides
});
