import { EVENT_ROLES } from "../../shared/constants/eventRoles";

/* ==================================================
   MEMBERSHIP PERMISSIONS HOOK
   Centralizes membership and role permission logic

   Handles:
   - current user role detection
   - event action permissions
   - member management permissions
   - ownership transfer permissions
   - membership UI visibility

   Notes:
   - accepts explicit currentUserRole for lightweight components
   - can also resolve role from members/staff collections
   - mirrors backend membership authorization rules
   - backend remains the source of truth for security
================================================== */

export default function useMembershipPermissions({
    user,
    currentUserRole = null,
    members = [],
    staff = [],
    isPast = false,
    isEventFull = false,
    isRegistrationClosed = false
}) {
    const currentUserId = user?.userId;

    /* =============================
       ROLE RESOLUTION
    ============================= */

    // Resolves current user's role from explicit role first,
    // then falls back to staff and members collections
    const myRole =
        currentUserRole ||
        staff.find((person) => person.id === currentUserId)?.role ||
        members.find((person) => person.id === currentUserId)?.role ||
        null;

    const isMember = Boolean(myRole);

    const isOrganizer = myRole === EVENT_ROLES.ORGANIZER;
    const isCoOrganizer = myRole === EVENT_ROLES.CO_ORGANIZER;
    const isParticipant = myRole === EVENT_ROLES.PARTICIPANT;

    /* =============================
       EVENT ACTION PERMISSIONS
    ============================= */

    // Determines whether the current user can join the event
    const canJoin =
        Boolean(user) &&
        !isPast &&
        !isMember &&
        !isEventFull &&
        !isRegistrationClosed;

    // Determines whether the current user can leave the event
    const canLeave =
        Boolean(user) &&
        !isPast &&
        isMember &&
        !isOrganizer;

    // Determines whether the current user can edit the event
    const canEdit =
        Boolean(user) &&
        !isPast &&
        (isOrganizer || isCoOrganizer);

    // Determines whether the current user can delete the event
    const canDelete =
        Boolean(user) &&
        !isPast &&
        isOrganizer;

    /* =============================
       MEMBER MANAGEMENT PERMISSIONS
    ============================= */

    const canPromote = (person) =>
        !isPast &&
        isOrganizer &&
        person.role === EVENT_ROLES.PARTICIPANT &&
        person.id !== currentUserId;

    const canDemote = (person) =>
        !isPast &&
        isOrganizer &&
        person.role === EVENT_ROLES.CO_ORGANIZER &&
        person.id !== currentUserId;

    const canRemove = (person) => {
        if (isPast) return false;

        if (person.id === currentUserId) {
            return false;
        }

        if (person.role === EVENT_ROLES.ORGANIZER) {
            return false;
        }

        if (isOrganizer) {
            return (
                person.role === EVENT_ROLES.PARTICIPANT ||
                person.role === EVENT_ROLES.CO_ORGANIZER
            );
        }

        if (isCoOrganizer) {
            return person.role === EVENT_ROLES.PARTICIPANT;
        }

        return false;
    };

    /* =============================
       OWNERSHIP TRANSFER PERMISSIONS
    ============================= */

    const canTransferOwnershipTo = (person) => {
        if (isPast) return false;

        if (!isOrganizer) {
            return false;
        }

        if (person.id === currentUserId) {
            return false;
        }

        if (!person.role) {
            return false;
        }

        return (
            person.role === EVENT_ROLES.PARTICIPANT ||
            person.role === EVENT_ROLES.CO_ORGANIZER
        );
    };

    /* =============================
       UI VISIBILITY HELPERS
    ============================= */

    const showJoinButton = canJoin;

    return {
        currentUserId,
        myRole,

        isMember,
        isOrganizer,
        isCoOrganizer,
        isParticipant,

        canJoin,
        canLeave,
        canEdit,
        canDelete,

        canPromote,
        canDemote,
        canRemove,
        canTransferOwnershipTo,

        showJoinButton
    };
}
