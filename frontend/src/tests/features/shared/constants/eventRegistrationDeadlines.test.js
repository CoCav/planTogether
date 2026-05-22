import { describe, expect, it } from "vitest";

import {
    EVENT_REGISTRATION_DEADLINES,
    EVENT_REGISTRATION_DEADLINE_LABELS,
    VALID_EVENT_REGISTRATION_DEADLINES,
    getEventRegistrationDeadlineLabel
} from "../../../../features/shared/constants/eventRegistrationDeadlines";

/* ==================================================
   EVENT REGISTRATION DEADLINES TESTS
   Tests shared registration deadline constants and helpers

   Handles:
   - registration deadline constants
   - valid registration deadline values
   - registration deadline labels
   - display label helper

   Notes:
   - keeps frontend registration deadline values centralized
================================================== */

describe("eventRegistrationDeadlines", () => {

    /* =============================
       CONSTANTS
    ============================= */

    it("should expose registration deadline constants", () => {
        expect(EVENT_REGISTRATION_DEADLINES).toEqual({
            NONE: "none",
            DAY_BEFORE: "day_before",
            TWO_DAYS_BEFORE: "two_days_before",
            CUSTOM: "custom"
        });
    });

    it("should expose valid registration deadline values", () => {
        expect(VALID_EVENT_REGISTRATION_DEADLINES).toEqual([
            "none",
            "day_before",
            "two_days_before",
            "custom"
        ]);
    });

    /* =============================
       LABELS
    ============================= */

    it("should expose registration deadline labels", () => {
        expect(EVENT_REGISTRATION_DEADLINE_LABELS).toEqual({
            none: "No deadline",
            day_before: "1 day before event",
            two_days_before: "2 days before event",
            custom: "Custom date"
        });
    });

    /* =============================
       DISPLAY HELPERS
    ============================= */

    it("should return display-friendly registration deadline labels", () => {
        expect(getEventRegistrationDeadlineLabel("none")).toBe("No deadline");

        expect(getEventRegistrationDeadlineLabel("day_before")).toBe("1 day before event");

        expect(getEventRegistrationDeadlineLabel("two_days_before")).toBe("2 days before event");

        expect(getEventRegistrationDeadlineLabel("custom")).toBe("Custom date");
    });

    it("should fallback to raw registration deadline value when label does not exist", () => {
        expect(getEventRegistrationDeadlineLabel("unknown")).toBe("unknown");
    });
});
