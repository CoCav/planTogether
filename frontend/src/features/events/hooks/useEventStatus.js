import { EVENT_STATUS } from "../../shared/eventStatus";

/* ==================================================
   EVENT STATUS HOOK
   Centralizes event availability and status logic

   Handles:
   - past event detection
   - participant limit checks
   - registration deadline checks
   - event availability UI helpers
================================================== */

export default function useEventStatus({ user, event, isMember = false }) {

    /* =============================
       EVENT AVAILABILITY
    ============================= */

    const isPast = event?.status === EVENT_STATUS.PAST;

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

    /* =============================
       UI VISIBILITY
    ============================= */

    const showEventFullButton =
        !isPast &&
        isEventFull;

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

    return {
        isPast,
        isEventFull,
        isRegistrationClosed,
        showEventFullButton,
        showLoginPrompt,
        showRegistrationClosedButton,
        joinDisabledReason
    };
}
