/* ==================================================
   EVENT REGISTRATION DEADLINE CONSTANTS
   Centralizes shared event registration deadline values

   Notes:
   - used by event forms, validation and payload builders
   - keeps registration deadline values aligned across the frontend
================================================== */

export const EVENT_REGISTRATION_DEADLINES = {
    NONE: "none",
    DAY_BEFORE: "day_before",
    TWO_DAYS_BEFORE: "two_days_before",
    CUSTOM: "custom"
};

export const VALID_EVENT_REGISTRATION_DEADLINES = Object.values(
    EVENT_REGISTRATION_DEADLINES
);

/* ==================================================
   EVENT REGISTRATION DEADLINE LABELS
   Human-readable labels for registration deadline options
================================================== */

export const EVENT_REGISTRATION_DEADLINE_LABELS = {
    [EVENT_REGISTRATION_DEADLINES.NONE]: "No deadline",
    [EVENT_REGISTRATION_DEADLINES.DAY_BEFORE]: "1 day before event",
    [EVENT_REGISTRATION_DEADLINES.TWO_DAYS_BEFORE]: "2 days before event",
    [EVENT_REGISTRATION_DEADLINES.CUSTOM]: "Custom date"
};

/* =============================
   DISPLAY HELPERS
============================= */

// Resolves a display-friendly registration deadline label
export const getEventRegistrationDeadlineLabel = (deadline) => {
    return EVENT_REGISTRATION_DEADLINE_LABELS[deadline] || deadline;
};
