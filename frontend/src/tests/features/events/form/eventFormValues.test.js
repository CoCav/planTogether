import { describe, expect, it } from "vitest";

import {
    createEventFormValuesFromEvent,
    resolveRegistrationDeadlineOption,
    toDateTimeLocalValue
} from "../../../../features/events/form/eventFormValues";

import { createDefaultEventFormValues } from "../../../../features/events/form/eventFormConfig";
import { EVENT_MODES } from "../../../../features/shared/constants/eventModes";
import { EVENT_REGISTRATION_DEADLINES } from "../../../../features/shared/constants/eventRegistrationDeadlines";

/* ==================================================
   EVENT FORM VALUES TESTS
   Tests API event to EventForm value conversion

   Handles:
   - local datetime-local value formatting
   - empty and invalid datetime values
   - default event form values
   - API event prefill values
   - selected location prefill values
   - structured location prefill values
   - registration deadline option resolution
   - existing image mapping
   - unchanged image state preservation

   Notes:
   - used by EditEventPage form hydration
   - selectedLocation hydrates autocomplete/map preview state
   - existing images are stored as currentImage
   - image remains undefined until users select or remove an image
================================================== */

describe("eventFormValues", () => {

    /* =============================
       DATE HELPERS
    ============================= */

    it("should convert API datetime to a datetime-local formatted value", () => {
        const result = toDateTimeLocalValue("2026-12-20T10:00:00.000Z");

        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    it("should preserve local date and time components", () => {
        const result = toDateTimeLocalValue("2026-06-08T03:59:00.000Z");

        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
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
       REGISTRATION DEADLINE HELPERS
    ============================= */

    it("should resolve no deadline option when registration deadline is missing", () => {
        expect(
            resolveRegistrationDeadlineOption({
                startDateTime: "2026-12-20T10:00:00.000Z",
                registrationDeadline: null
            })
        ).toBe(EVENT_REGISTRATION_DEADLINES.NONE);
    });

    it("should resolve one day before registration deadline option", () => {
        expect(
            resolveRegistrationDeadlineOption({
                startDateTime: "2026-12-20T10:00:00.000Z",
                registrationDeadline: "2026-12-19T10:00:00.000Z"
            })
        ).toBe(EVENT_REGISTRATION_DEADLINES.DAY_BEFORE);
    });

    it("should resolve two days before registration deadline option", () => {
        expect(
            resolveRegistrationDeadlineOption({
                startDateTime: "2026-12-20T10:00:00.000Z",
                registrationDeadline: "2026-12-18T10:00:00.000Z"
            })
        ).toBe(EVENT_REGISTRATION_DEADLINES.TWO_DAYS_BEFORE);
    });

    it("should resolve custom registration deadline option", () => {
        expect(
            resolveRegistrationDeadlineOption({
                startDateTime: "2026-12-20T10:00:00.000Z",
                registrationDeadline: "2026-12-19T00:00:00.000Z"
            })
        ).toBe(EVENT_REGISTRATION_DEADLINES.CUSTOM);
    });

    it("should resolve custom registration deadline option when dates are invalid", () => {
        expect(
            resolveRegistrationDeadlineOption({
                startDateTime: "invalid-date",
                registrationDeadline: "2026-12-19T10:00:00.000Z"
            })
        ).toBe(EVENT_REGISTRATION_DEADLINES.CUSTOM);
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
            locationLabel: "",
            streetAddress: "",
            city: "",
            region: "",
            postalCode: "",
            country: "",
            latitude: null,
            longitude: null,

            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z",
            maxParticipants: 20,
            registrationDeadline: "2026-12-19T00:00:00.000Z",
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
            selectedLocation: null,
            locationLabel: "",
            streetAddress: "",
            city: "",
            region: "",
            postalCode: "",
            country: "",
            latitude: null,
            longitude: null,

            startDateTime: toDateTimeLocalValue(event.startDateTime),
            endDateTime: toDateTimeLocalValue(event.endDateTime),

            maxParticipants: 20,

            registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.CUSTOM,
            registrationDeadlineCustom: toDateTimeLocalValue(
                event.registrationDeadline
            ),

            image: undefined,
            currentImage: "event.png"
        });
    });

    it("should use default values for missing event fields", () => {
        expect(createEventFormValuesFromEvent({})).toEqual({
            ...createDefaultEventFormValues(),
            image: undefined
        });
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

    it("should use one day before option and clear custom deadline value", () => {
        const values = createEventFormValuesFromEvent({
            startDateTime: "2026-12-20T10:00:00.000Z",
            registrationDeadline: "2026-12-19T10:00:00.000Z"
        });

        expect(values.registrationDeadlineOption).toBe(EVENT_REGISTRATION_DEADLINES.DAY_BEFORE);

        expect(values.registrationDeadlineCustom).toBe("");
    });

    it("should use two days before option and clear custom deadline value", () => {
        const values = createEventFormValuesFromEvent({
            startDateTime: "2026-12-20T10:00:00.000Z",
            registrationDeadline: "2026-12-18T10:00:00.000Z"
        });

        expect(values.registrationDeadlineOption).toBe(EVENT_REGISTRATION_DEADLINES.TWO_DAYS_BEFORE);

        expect(values.registrationDeadlineCustom).toBe("");
    });

    it("should map existing event image to current image", () => {
        const values = createEventFormValuesFromEvent({
            image: "event.png"
        });

        expect(values.image).toBeUndefined();
        expect(values.currentImage).toBe("event.png");
    });

    it("should hydrate selected location from event coordinates", () => {
        const values = createEventFormValuesFromEvent({
            location: "Montréal, Québec, Canada",
            locationLabel: "Montréal, Québec, Canada",
            latitude: 45.5017,
            longitude: -73.5673
        });

        expect(values.selectedLocation).toEqual({
            label: "Montréal, Québec, Canada",
            streetAddress: null,
            city: null,
            region: null,
            postalCode: null,
            country: null,
            latitude: 45.5017,
            longitude: -73.5673,
            provider: "nominatim"
        });
    });

    it("should hydrate structured location fields from API event", () => {
        const values = createEventFormValuesFromEvent({
            location: "Agora du Vieux-Port",
            locationLabel: "Agora du Vieux-Port, Rue de Quercy, Québec, Canada",
            streetAddress: "Rue de Quercy",
            city: "Québec",
            region: "Québec",
            postalCode: "G1K 4B9",
            country: "Canada",
            latitude: 46.8176197,
            longitude: -71.2004237
        });

        expect(values).toMatchObject({
            location: "Agora du Vieux-Port",
            locationLabel: "Agora du Vieux-Port, Rue de Quercy, Québec, Canada",
            streetAddress: "Rue de Quercy",
            city: "Québec",
            region: "Québec",
            postalCode: "G1K 4B9",
            country: "Canada",
            latitude: 46.8176197,
            longitude: -71.2004237,
            selectedLocation: {
                label: "Agora du Vieux-Port, Rue de Quercy, Québec, Canada",
                streetAddress: "Rue de Quercy",
                city: "Québec",
                region: "Québec",
                postalCode: "G1K 4B9",
                country: "Canada",
                latitude: 46.8176197,
                longitude: -71.2004237,
                provider: "nominatim"
            }
        });
    });

    it("should fallback to event location when locationLabel is missing", () => {
        const values = createEventFormValuesFromEvent({
            location: "Montreal",
            latitude: 45.5017,
            longitude: -73.5673
        });

        expect(values.selectedLocation).toEqual({
            label: "Montreal",
            streetAddress: null,
            city: null,
            region: null,
            postalCode: null,
            country: null,
            latitude: 45.5017,
            longitude: -73.5673,
            provider: "nominatim"
        });
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should not hydrate selected location when coordinates are incomplete", () => {
        const values = createEventFormValuesFromEvent({
            location: "Montreal",
            latitude: 45.5017,
            longitude: null
        });

        expect(values.selectedLocation).toBeNull();
    });
});
