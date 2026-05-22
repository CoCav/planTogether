import { describe, expect, it } from "vitest";

import { createEventFormValuesFromEvent, toDateTimeLocalValue } from "../../../../features/events/form/eventFormValues";

import { createDefaultEventFormValues } from "../../../../features/events/form/eventFormConfig";
import { EVENT_MODES } from "../../../../features/shared/constants/eventModes";
import { EVENT_REGISTRATION_DEADLINES } from "../../../../features/shared/constants/eventRegistrationDeadlines";

/* ==================================================
   EVENT FORM VALUES TESTS
   Tests API event to EventForm value conversion

   Handles:
   - datetime-local value formatting
   - empty and invalid datetime values
   - default event form values
   - API event prefill values
   - registration deadline mapping
   - existing image mapping

   Notes:
   - used by EditEventPage form hydration
================================================== */

describe("eventFormValues", () => {

    /* =============================
       DATE HELPERS
    ============================= */

    it("should convert API datetime to datetime-local value", () => {
        expect(
            toDateTimeLocalValue("2026-12-20T10:00:00.000Z")
        ).toBe("2026-12-20T10:00");
    });

    it("should return empty string for missing datetime value", () => {
        expect(toDateTimeLocalValue()).toBe("");
        expect(toDateTimeLocalValue(null)).toBe("");
        expect(toDateTimeLocalValue("")).toBe("");
    });

    it("should return empty string for invalid datetime value", () => {
        expect(toDateTimeLocalValue("invalid-date")).toBe("");
    });

    /* =============================
       EVENT FORM VALUES
    ============================= */

    it("should build event form values from API event", () => {
        const event = {
            title: "React Meetup",
            description: "A meetup about React",
            type: "Meetup",
            theme: "Web",
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z",
            maxParticipants: 20,
            registrationDeadline: "2026-12-19T12:00:00.000Z",
            image: "event.png"
        };

        expect(createEventFormValuesFromEvent(event)).toEqual({
            ...createDefaultEventFormValues(),

            title: "React Meetup",
            description: "A meetup about React",

            type: "Meetup",
            theme: "Web",

            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",

            startDateTime: "2026-12-20T10:00",
            endDateTime: "2026-12-20T12:00",

            maxParticipants: 20,

            registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.CUSTOM,
            registrationDeadlineCustom: "2026-12-19T12:00",

            image: null,
            currentImage: "event.png"
        });
    });

    it("should use default values for missing event fields", () => {
        expect(createEventFormValuesFromEvent({})).toEqual(
            createDefaultEventFormValues()
        );
    });

    it("should fallback to in-person mode when event mode is missing", () => {
        const values = createEventFormValuesFromEvent({
            mode: ""
        });

        expect(values.mode).toBe(EVENT_MODES.IN_PERSON);
    });

    it("should keep online mode when API event is online", () => {
        const values = createEventFormValuesFromEvent({
            mode: EVENT_MODES.ONLINE,
            location: null
        });

        expect(values.mode).toBe(EVENT_MODES.ONLINE);
        expect(values.location).toBe("");
    });

    it("should use no deadline option when event has no registration deadline", () => {
        const values = createEventFormValuesFromEvent({
            registrationDeadline: null
        });

        expect(values.registrationDeadlineOption).toBe(EVENT_REGISTRATION_DEADLINES.NONE);

        expect(values.registrationDeadlineCustom).toBe("");
    });

    it("should map existing event image to current image", () => {
        const values = createEventFormValuesFromEvent({
            image: "event.png"
        });

        expect(values.image).toBeNull();
        expect(values.currentImage).toBe("event.png");
    });
});
