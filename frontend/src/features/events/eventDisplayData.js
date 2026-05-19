import { formatCount, formatEventDateRange, formatTime } from "../../utils/formatters";

import { EVENT_MODES, getEventModeLabel } from "../shared/eventModes";

/* ==================================================
   EVENT DISPLAY DATA
   Builds display-ready values for event UI

   Handles:
   - fallback text values
   - formatted date and time
   - display mode and location
   - participant display labels
   - capacity display
   - registration deadline display
================================================== */

export function getEventDisplayData(event) {
    const isOnline = event.mode === EVENT_MODES.ONLINE;

    return {
        title: event.title || "No title provided.",

        description: event.description || "No description provided.",

        type: event.type || "N/A",

        theme: event.theme || "N/A",

        date: formatEventDateRange(event.startDateTime, event.endDateTime),

        time: `${formatTime(event.startDateTime)} → ${formatTime(event.endDateTime)}`,

        mode: getEventModeLabel(event.mode),

        location: isOnline
            ? getEventModeLabel(EVENT_MODES.ONLINE)
            : event.location || "N/A",

        participantLabel: event.maxParticipants
            ? `${event.participantCount} / ${event.maxParticipants}`
            : formatCount(event.participantCount, "participant"),

        capacity: event.maxParticipants
            ? `${event.participantCount} / ${event.maxParticipants}`
            : null,

        registrationDeadline: event.registrationDeadline
            ? formatEventDateRange(event.registrationDeadline, event.registrationDeadline)
            : null
    };
}
