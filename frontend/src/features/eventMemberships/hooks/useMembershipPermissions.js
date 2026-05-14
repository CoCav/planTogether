/* ==================================================
   MEMBERSHIP PERMISSIONS HOOK
   Centralizes membership and role permission logic

   Handles:
   - current user role detection
   - event action permissions
   - member management permissions
   - membership UI visibility
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
        myRole === "organizer";

    const isCoOrganizer =
        myRole === "co_organizer";

    const isParticipant =
        myRole === "participant";

    /* =============================
       EVENT ACTION PERMISSIONS
    ============================= */

    const canJoin =
        Boolean(user) &&
        !isPast &&
        !isMember &&
        !isEventFull &&
        !isRegistrationClosed;

    const canLeave =
        Boolean(user) &&
        !isPast &&
        isMember &&
        !isOrganizer;

    const canEdit =
        Boolean(user) &&
        !isPast &&
        (isOrganizer || isCoOrganizer);

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
        person.role === "participant" &&
        person.id !== currentUserId;

    const canDemote = (person) =>
        !isPast &&
        isOrganizer &&
        person.role === "co_organizer" &&
        person.id !== currentUserId;

    const canRemove = (person) => {
        if (isPast) return false;

        if (person.id === currentUserId) {
            return false;
        }

        if (isOrganizer) {
            return (
                person.role === "participant" ||
                person.role === "co_organizer"
            );
        }

        if (isCoOrganizer) {
            return person.role === "participant";
        }

        return false;
    };

    /* =============================
       UI VISIBILITY
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

        showJoinButton
    };
}
