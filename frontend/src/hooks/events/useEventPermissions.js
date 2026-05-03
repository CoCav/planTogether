/* ==================================================
   EVENT PERMISSIONS HOOK
   Centralizes event UI permission logic

   Handles:
   - current user role detection
   - event state checks
   - event action permissions
   - member management permissions
   - UI visibility helpers
================================================== */

export default function useEventPermissions({ user, event, members = [], organizers = [] }) {
    const currentUserId = user?.userId;

    /* =========================
        Role resolution
        Finds current user's role in the event
    ========================= */

    const myRole =
        organizers.find((person) => person.id === currentUserId)?.role ||
        members.find((person) => person.id === currentUserId)?.role ||
        null;

    const isMember = Boolean(myRole);
    const isOrganizer = myRole === "organizer";
    const isCoOrganizer = myRole === "co_organizer";
    const isParticipant = myRole === "participant";

    /* =========================
        Event state
        Computes event availability constraints
    ========================= */

    const isPast = event?.status === "past";

    const participantCount = event?.participantCount ?? 0;
    const maxParticipants = event?.maxParticipants ?? null;
    const registrationDeadline = event?.registrationDeadline ?? null;

    const hasParticipantLimit =
        maxParticipants !== null &&
        maxParticipants !== undefined &&
        maxParticipants !== "";

    const isEventFull =
        hasParticipantLimit &&
        participantCount >= Number(maxParticipants);

    const isRegistrationClosed =
        Boolean(registrationDeadline) &&
        new Date(registrationDeadline).getTime() <= Date.now();

    /* =========================
        Event actions permissions
        Controls join / leave / edit / delete buttons
    ========================= */

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

    /* =========================
       UI visibility helpers
    ========================= */

    const showEventFullButton =
        !isPast &&
        isEventFull;

    const showJoinButton =
        canJoin;

    const showLoginPrompt =
        !user &&
        !isPast &&
        !isEventFull;

    const showRegistrationClosedButton =
        Boolean(user) &&
        !isPast &&
        !isMember &&
        !isEventFull &&
        isRegistrationClosed;

    const joinDisabledReason = (() => {
        if (!user) return null;
        if (isPast) return "Event ended";
        if (isMember) return null;
        if (isEventFull) return "Event full";
        if (isRegistrationClosed) return "Registration closed";

        return null;
    })();

    /* =========================
       Member management permissions
       Controls promote / demote / remove actions
    ========================= */

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
        if (person.id === currentUserId) return false;

        if (isOrganizer) {
            return person.role === "participant" || person.role === "co_organizer";
        }

        if (isCoOrganizer) {
            return person.role === "participant";
        }

        return false;
    };

    return {
        currentUserId,
        myRole,
        isMember,
        isOrganizer,
        isCoOrganizer,
        isParticipant,
        isPast,
        isEventFull,
        isRegistrationClosed,

        canJoin,
        canLeave,
        canEdit,
        canDelete,
        canPromote,
        canDemote,
        canRemove,

        showEventFullButton,
        showJoinButton,
        showLoginPrompt,
        showRegistrationClosedButton,

        joinDisabledReason
    };
}
