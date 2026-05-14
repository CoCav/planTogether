import { EVENT_ROLES } from "../../shared/eventRoles";

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
   - mirrors backend membership authorization rules
   - backend remains the source of truth for security
================================================== */

export default function useMembershipPermissions({
    user,
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

    // Finds current user's role in the event
    const myRole =
        staff.find((person) => person.id === currentUserId)?.role ||
        members.find((person) => person.id === currentUserId)?.role ||
        null;

    const isMember = Boolean(myRole);

    const isOrganizer =
        myRole === EVENT_ROLES.ORGANIZER;

    const isCoOrganizer =
        myRole === EVENT_ROLES.CO_ORGANIZER;

    const isParticipant =
        myRole === EVENT_ROLES.PARTICIPANT;

    /* =============================
       EVENT ACTION PERMISSIONS
    ============================= */

    // Determines whether the user can join the event
    const canJoin =
        Boolean(user) &&
        !isPast &&
        !isMember &&
        !isEventFull &&
        !isRegistrationClosed;

    // Determines whether the user can leave the event
    const canLeave =
        Boolean(user) &&
        !isPast &&
        isMember &&
        !isOrganizer;

    // Determines whether the user can edit the event
    const canEdit =
        Boolean(user) &&
        !isPast &&
        (isOrganizer || isCoOrganizer);

    // Determines whether the user can delete the event
    const canDelete =
        Boolean(user) &&
        !isPast &&
        isOrganizer;

    /* =============================
       MEMBER MANAGEMENT PERMISSIONS
    ============================= */

    // Determines whether a member can be promoted
    const canPromote = (person) =>
        !isPast &&
        isOrganizer &&
        person.role === EVENT_ROLES.PARTICIPANT &&
        person.id !== currentUserId;

    // Determines whether a co-organizer can be demoted
    const canDemote = (person) =>
        !isPast &&
        isOrganizer &&
        person.role === EVENT_ROLES.CO_ORGANIZER &&
        person.id !== currentUserId;

    // Determines whether a member can be removed
    const canRemove = (person) => {
        if (isPast) return false;

        // Prevent self-removal through management actions
        if (person.id === currentUserId) {
            return false;
        }

        // Organizer cannot be removed
        if (person.role === EVENT_ROLES.ORGANIZER) {
            return false;
        }

        // Organizer can remove participants and co-organizers
        if (isOrganizer) {
            return (
                person.role === EVENT_ROLES.PARTICIPANT ||
                person.role === EVENT_ROLES.CO_ORGANIZER
            );
        }

        // Co-organizers can only remove participants
        if (isCoOrganizer) {
            return person.role === EVENT_ROLES.PARTICIPANT;
        }

        return false;
    };

    /* =============================
       OWNERSHIP TRANSFER PERMISSIONS
    ============================= */

    // Determines whether ownership can be transferred
    const canTransferOwnershipTo = (person) => {
        if (isPast) return false;

        // Only organizers can transfer ownership
        if (!isOrganizer) {
            return false;
        }

        // Cannot transfer ownership to self
        if (person.id === currentUserId) {
            return false;
        }

        // Target must already belong to the event
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
