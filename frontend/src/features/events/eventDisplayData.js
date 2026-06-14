import {
    formatCount,
    formatEventDateRange,
    formatLocationInlineLabel,
    formatTime
} from "../../utils/formatters";

import { EVENT_MODES, getEventModeLabel } from "../shared/constants/eventModes";

/* ==================================================
   EVENT DISPLAY DATA
   Builds display-ready values for event UI

   Handles:
   - fallback text values
   - formatted date and time
   - inline location display formatting
   - selected location map data
   - online/in-person mode display
   - participant and capacity display
   - registration deadline display
   - event status display data

   Notes:
   - selectedLocation is used by map components
   - location labels support provider-formatted addresses
================================================== */

export function getEventDisplayData(event) {
    const isOnline = event.mode === EVENT_MODES.ONLINE;

    // Prefer persisted provider label before fallback event location
    const locationLabel =
        event.locationLabel ||
        event.selectedLocation?.label ||
        event.location ||
        "N/A";

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
            : formatLocationInlineLabel(locationLabel),

        // Build map-ready location data only for physical events
        selectedLocation: !isOnline && event.latitude && event.longitude
            ? {
                label: locationLabel,
                latitude: event.latitude,
                longitude: event.longitude,
                provider: "nominatim"
            }
            : null,

        participantLabel: event.maxParticipants
            ? `${event.participantCount} / ${event.maxParticipants}`
            : formatCount(event.participantCount, "participant"),

        capacity: event.maxParticipants
            ? `${event.participantCount} / ${event.maxParticipants}`
            : null,

        registrationDeadline: event.registrationDeadline
            ? formatEventDateRange(event.registrationDeadline, event.registrationDeadline)
            : null,

        status: event.status
    };
}
