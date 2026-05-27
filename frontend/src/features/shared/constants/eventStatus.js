/* ==================================================
   EVENT STATUS CONSTANTS
   Centralizes shared event status values

   Notes:
   - mirrors backend event status constants
   - used by event filters, status checks and UI helpers
================================================== */

export const EVENT_STATUS = {
    UPCOMING: "upcoming",
    ONGOING: "ongoing",
    PAST: "past"
};

export const VALID_EVENT_STATUS = Object.values(EVENT_STATUS);

/* ==================================================
   EVENT STATUS LABELS
   Human-readable labels for event statuses
================================================== */

export const EVENT_STATUS_LABELS = {
    [EVENT_STATUS.UPCOMING]: "Upcoming",
    [EVENT_STATUS.ONGOING]: "Ongoing",
    [EVENT_STATUS.PAST]: "Ended"
};

/* =============================
   DISPLAY HELPERS
============================= */

// Resolves a display-friendly event status label
export const getEventStatusLabel = (status) => {
    return EVENT_STATUS_LABELS[status] || status;
};


/* ==================================================
   EVENT STATUS UI
   Shared display labels and badge variants

   Notes:
   - used by status badges and event UI
   - centralizes status display configuration
================================================== */

export const EVENT_STATUS_UI = {
    [EVENT_STATUS.UPCOMING]: {
        label: "Upcoming",
        badgeVariant: "upcoming"
    },

    [EVENT_STATUS.ONGOING]: {
        label: "Ongoing",
        badgeVariant: "ongoing"
    },

    [EVENT_STATUS.PAST]: {
        label: "Ended",
        badgeVariant: "past"
    }
};
