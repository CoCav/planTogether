/**
 * ==================================================
 * EVENT PERMISSIONS HOOK
 * --------------------------------------------------
 * Centralizes all UI permission logic related to events.
 *
 * This hook determines:
 *  - The current user's role in the event
 *  - Whether the event is past, full, or closed for registration
 *  - Which event actions should be available in the UI
 *  - Which member management actions are allowed
 *
 * Goal:
 * Keep pages/components clean by removing complex
 * conditional logic from UI rendering.
 * ==================================================
*/

export default function useEventPermissions({ user, event, members = [], organizers = [] }) {

    // Current user identification: Used to compare against event members
    const currentUserId = user?.userId;

    // Role resolution: Determines the current user's role by checking organizers first, then members
    const myRole = organizers.find((person) => person.id === currentUserId)?.role || members.find((person) => person.id === currentUserId)?.role || null;
    const isMember = !!myRole;


    /* ==========================================
     Event state
        Computes global event state used to enable or disable user actions
    ============================================= */

    const isPast = event?.status === "past";
    const participantCount = event?.participantCount ?? 0;
    const maxParticipants = event?.maxParticipants ?? null;
    const registrationDeadline = event?.registrationDeadline ?? null;

    // Capacity constraints: Checks if the event has a limit and if it is reached
    const hasParticipantLimit = maxParticipants !== null && maxParticipants !== undefined;
    const isEventFull = hasParticipantLimit && participantCount >= Number(maxParticipants);

    // Registration constraints: Checks if the registration deadline has passed
    const isRegistrationClosed = !!registrationDeadline && new Date(registrationDeadline).getTime() <= Date.now();


    /* ==========================================
     Event action permissions
        Determines which main actions are available for the current user
    ============================================= */

    const canJoin = !!user && !isPast && !isMember && !isEventFull && !isRegistrationClosed;
    const canLeave = !!user && !isPast && isMember && myRole !== "organizer";
    const canEdit = !!user && !isPast && (myRole === "organizer" || myRole === "co_organizer");
    const canDelete = !!user && !isPast && myRole === "organizer";


    // Join disabled reason: Provides a user-friendly explanation when joining is not allowed
    const joinDisabledReason = (() => {
        if (!user) return null;
        if (isPast) return "Event ended";
        if (isMember) return null;
        if (isEventFull) return "Event full";
        if (isRegistrationClosed) return "Registration closed";
        return null;
    })();


    /* ==========================================
     Member management permissions
        Determines what actions the current user can perform on other members
    ============================================= */

    const canPromote = (person) => !isPast && myRole === "organizer" && person.role === "participant" && person.id !== currentUserId;
    const canDemote = (person) => !isPast && myRole === "organizer" && person.role === "co_organizer" && person.id !== currentUserId;

    const canRemove = (person) => {
        if (isPast) return false;
        if (person.id === currentUserId) return false;

        if (myRole === "organizer") {
            return person.role === "participant" || person.role === "co_organizer";
        }

        if (myRole === "co_organizer") {
            return person.role === "participant";
        }

        return false;
    };

    return { currentUserId, myRole, isMember, isPast, isEventFull, isRegistrationClosed, canJoin, canLeave, canEdit, canDelete, canPromote, canDemote, canRemove, joinDisabledReason };
}