/* ==================================================
   EVENT MODE CONSTANTS
   Centralizes shared event mode values

   Notes:
   - mirrors backend event mode constants
   - used by event validation, forms and UI helpers
================================================== */

export const EVENT_MODES = {
    ONLINE: "online",
    IN_PERSON: "in_person"
};

export const VALID_EVENT_MODES = Object.values(EVENT_MODES);

/* ==================================================
   EVENT MODE LABELS
   Human-readable labels for event modes
================================================== */

export const EVENT_MODE_LABELS = {
    [EVENT_MODES.ONLINE]: "Online",
    [EVENT_MODES.IN_PERSON]: "In person"
};

/* =============================
   DISPLAY HELPERS
============================= */

// Resolves a display-friendly event mode label
export const getEventModeLabel = (mode) => {
    return EVENT_MODE_LABELS[mode] || mode;
};
