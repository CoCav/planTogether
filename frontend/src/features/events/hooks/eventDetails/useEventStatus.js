import { EVENT_STATUS } from "../../../shared/constants/eventStatus";

/* ==================================================
   EVENT STATUS HOOK
   Centralizes event availability and status logic

   Handles:
   - past event detection
   - started event detection
   - participant limit checks
   - registration deadline checks
   - login prompt visibility
   - join disabled reason resolution
================================================== */

export default function useEventStatus({ user, event, isMember = false }) {

    /* =============================
       EVENT AVAILABILITY
    ============================= */

    const isPast = event?.status === EVENT_STATUS.PAST;

    // Checks whether the event has already started
    const isStarted =
        Boolean(event?.startDateTime) &&
        new Date(event.startDateTime).getTime() <= Date.now();

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

    const showLoginPrompt =
        !user &&
        !isPast &&
        !isEventFull;

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
        isStarted,
        isEventFull,
        isRegistrationClosed,
        showLoginPrompt,
        joinDisabledReason
    };
}
