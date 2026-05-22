import { describe, expect, it } from "vitest";

import {
    EVENT_MODE_OPTIONS,
    EVENT_REGISTRATION_DEADLINE_OPTIONS,
    createDefaultEventFormValues,
    isOnlineEventForm,
    shouldShowCustomDeadline
} from "../../../../features/events/form/eventFormConfig";

import { EVENT_MODES } from "../../../../features/shared/constants/eventModes";
import { EVENT_REGISTRATION_DEADLINES } from "../../../../features/shared/constants/eventRegistrationDeadlines";

/* ==================================================
   EVENT FORM CONFIG TESTS
   Tests shared event form configuration

   Handles:
   - default event form values
   - event mode select options
   - registration deadline select options
   - event form display helpers

   Notes:
   - event mode values come from shared constants
   - registration deadline values come from shared constants
================================================== */

describe("eventFormConfig", () => {

    /* =============================
       DEFAULT VALUES
    ============================= */

    it("should return default event form values", () => {
        expect(createDefaultEventFormValues()).toEqual({
            title: "",
            description: "",
            type: "",
            theme: "",

            mode: EVENT_MODES.IN_PERSON,
            location: "",

            startDateTime: "",
            endDateTime: "",

            maxParticipants: "",

            registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.NONE,
            registrationDeadlineCustom: "",

            image: null,
            currentImage: null
        });
    });

    /* =============================
       SELECT OPTIONS
    ============================= */

    it("should expose event mode select options", () => {
        expect(EVENT_MODE_OPTIONS).toEqual([
            {
                value: EVENT_MODES.ONLINE,
                label: "Online"
            },
            {
                value: EVENT_MODES.IN_PERSON,
                label: "In person"
            }
        ]);
    });

    it("should expose registration deadline select options", () => {
        expect(EVENT_REGISTRATION_DEADLINE_OPTIONS).toEqual([
            {
                value: EVENT_REGISTRATION_DEADLINES.NONE,
                label: "No deadline"
            },
            {
                value: EVENT_REGISTRATION_DEADLINES.DAY_BEFORE,
                label: "1 day before event"
            },
            {
                value: EVENT_REGISTRATION_DEADLINES.TWO_DAYS_BEFORE,
                label: "2 days before event"
            },
            {
                value: EVENT_REGISTRATION_DEADLINES.CUSTOM,
                label: "Custom date"
            }
        ]);
    });

    /* =============================
       DISPLAY HELPERS
    ============================= */

    it("should detect online event form values", () => {
        expect(
            isOnlineEventForm({
                mode: EVENT_MODES.ONLINE
            })
        ).toBe(true);

        expect(
            isOnlineEventForm({
                mode: EVENT_MODES.IN_PERSON
            })
        ).toBe(false);
    });

    it("should detect custom registration deadline values", () => {
        expect(
            shouldShowCustomDeadline({
                registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.CUSTOM
            })
        ).toBe(true);

        expect(
            shouldShowCustomDeadline({
                registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.NONE
            })
        ).toBe(false);
    });
});
