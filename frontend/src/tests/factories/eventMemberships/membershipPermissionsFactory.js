import { EVENT_ROLES } from "../../../features/shared/eventRoles";

import { createAuthenticatedUser } from "../users/userFactory";

/* ==================================================
   MEMBERSHIP PERMISSIONS TEST FACTORY

   Handles:
   - permission hook user generation
   - member list generation
   - staff list generation
   - permission props generation

   Notes:
   - aligned with useMembershipPermissions
   - accepts overrides for flexible scenarios
================================================== */

/* =============================
   PERMISSION USERS
============================= */

// Generate a permission user
export const createPermissionUser = (overrides = {}) => (
    createAuthenticatedUser({
        userId: 1,

        ...overrides
    })
);

/* =============================
   MEMBERS
============================= */

// Generate a permission member item
export const createPermissionMember = (overrides = {}) => ({
    id: 1,
    name: "John Doe",
    email: "john@test.com",
    role: EVENT_ROLES.PARTICIPANT,

    ...overrides
});

// Generate a participant member item
export const createParticipantMember = (overrides = {}) => (
    createPermissionMember({
        role: EVENT_ROLES.PARTICIPANT,

        ...overrides
    })
);

// Generate a co-organizer member item
export const createCoOrganizerMember = (overrides = {}) => (
    createPermissionMember({
        role: EVENT_ROLES.CO_ORGANIZER,

        ...overrides
    })
);

// Generate an organizer member item
export const createOrganizerMember = (overrides = {}) => (
    createPermissionMember({
        role: EVENT_ROLES.ORGANIZER,

        ...overrides
    })
);

/* =============================
   STAFF
============================= */

// Generate a staff list with organizer
export const createOrganizerStaff = (overrides = {}) => ([
    createOrganizerMember({
        id: 1,

        ...overrides
    })
]);

// Generate a staff list with co-organizer
export const createCoOrganizerStaff = (overrides = {}) => ([
    createCoOrganizerMember({
        id: 1,

        ...overrides
    })
]);

/* =============================
   PERMISSION PROPS
============================= */

// Generate membership permission hook props
export const createMembershipPermissionProps = (overrides = {}) => ({
    user: createPermissionUser(),

    members: [],
    staff: [],

    isPast: false,
    isEventFull: false,
    isRegistrationClosed: false,

    ...overrides
});
