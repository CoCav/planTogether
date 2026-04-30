/* ==================================================
   EVENT PERMISSIONS HOOK
   Centralizes event UI permission logic

   Handles:
   - current user role detection
   - event state checks
   - event action permissions
   - member management permissions
================================================== */

export default function useEventPermissions({ user, event, members = [], organizers = [] }) {
    const currentUserId = user?.userId;

    /* =========================
       Role resolution
       Finds current user's role in the event
    ========================= */

    const myRole = organizers.find((person) => person.id === currentUserId)?.role || members.find((person) => person.id === currentUserId)?.role || null;

    const isMember = Boolean(myRole);

    /* =========================
       Event state
       Computes event availability constraints
    ========================= */

    const isPast = event?.status === "past";
    const participantCount = event?.participantCount ?? 0;
    const maxParticipants = event?.maxParticipants ?? null;
    const registrationDeadline = event?.registrationDeadline ?? null;

    const hasParticipantLimit = maxParticipants !== null && maxParticipants !== undefined;

    const isEventFull = hasParticipantLimit && participantCount >= Number(maxParticipants);

    const isRegistrationClosed = Boolean(registrationDeadline) && new Date(registrationDeadline).getTime() <= Date.now();

    /* =========================
       Event action permissions
       Controls join / leave / edit / delete buttons
    ========================= */

    const canJoin = Boolean(user) && !isPast && !isMember && !isEventFull && !isRegistrationClosed;

    const canLeave = Boolean(user) && !isPast && isMember && myRole !== "organizer";

    const canEdit = Boolean(user) && !isPast && (myRole === "organizer" || myRole === "co_organizer");

    const canDelete = Boolean(user) && !isPast && myRole === "organizer";

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

    const canPromote = (person) => !isPast && myRole === "organizer" && person.role === "participant" && person.id !== currentUserId;

    const canDemote = (person) => !isPast && myRole === "organizer" && person.role === "co_organizer" && person.id !== currentUserId;

    const canRemove = (person) => {
        if (isPast) return false;
        if (person.id === currentUserId) return false;

        if (myRole === "organizer") {
            return (
                person.role === "participant" || person.role === "co_organizer"
            );
        }

        if (myRole === "co_organizer") {
            return person.role === "participant";
        }

        return false;
    };

    return { currentUserId, myRole, isMember, isPast, isEventFull, isRegistrationClosed, canJoin, canLeave, canEdit, canDelete, canPromote, canDemote, canRemove, joinDisabledReason };
}
