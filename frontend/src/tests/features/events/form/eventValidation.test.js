import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { validateEventForm } from "../../../../features/events/form/eventValidation";

import { EVENT_MODES } from "../../../../features/shared/constants/eventModes";

import { createEventPayload, createOnlineEventPayload } from "../../../factories/events/eventPayloadFactory";

import { createMockImageFile, createMockInvalidFile, createMockOversizedFile } from "../../../helpers/mocks/mockFile";

/* ==================================================
   EVENT VALIDATION TESTS
   Tests create/edit event form validation

   Handles:
   - required event fields
   - event mode and location rules
   - start/end datetime validation
   - past datetime validation
   - participant limit validation
   - registration deadline validation
   - event image validation
   - partial update validation

   Notes:
   - uses reusable event payload factories
   - uses reusable upload file mock helpers
================================================== */

describe("eventValidation", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const validImage = createMockImageFile({
        name: "event.png"
    });

    const invalidImage = createMockInvalidFile({
        name: "event.txt"
    });

    const largeImage = createMockOversizedFile({
        name: "large.png",
        sizeInMb: 4
    });

    const validForm = createEventPayload({
        mode: EVENT_MODES.IN_PERSON,
        location: "Montreal",
        image: null
    });

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.useFakeTimers();

        vi.setSystemTime(new Date("2026-05-20T12:00:00"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    /* =============================
       VALID FORM
    ============================= */

    it("should return no errors for a valid in-person event", () => {
        expect(validateEventForm(validForm)).toEqual({});
    });

    it("should return no errors for a valid online event without location", () => {
        const errors = validateEventForm(
            createOnlineEventPayload({
                location: ""
            })
        );

        expect(errors).toEqual({});
    });

    it("should return no errors for a valid event with image", () => {
        const errors = validateEventForm({
            ...validForm,
            image: validImage
        });

        expect(errors).toEqual({});
    });

    /* =============================
       REQUIRED FIELDS
    ============================= */

    it("should require main text fields", () => {
        const errors = validateEventForm({
            ...validForm,
            title: "",
            description: "",
            type: "",
            theme: ""
        });

        expect(errors).toMatchObject({
            title: "Title is required",
            description: "Description is required",
            type: "Type is required",
            theme: "Theme is required"
        });
    });

    it("should require mode", () => {
        const errors = validateEventForm({
            ...validForm,
            mode: ""
        });

        expect(errors.mode).toBe("Mode is required");
    });

    it("should reject invalid mode", () => {
        const errors = validateEventForm({
            ...validForm,
            mode: "hybrid"
        });

        expect(errors.mode).toBe("Mode must be online or in_person");
    });

    it("should require start and end datetime fields", () => {
        const errors = validateEventForm({
            ...validForm,
            startDateTime: "",
            endDateTime: ""
        });

        expect(errors).toMatchObject({
            startDateTime: "Start date and time is required",
            endDateTime: "End date and time is required"
        });
    });

    /* =============================
       MODE / LOCATION
    ============================= */

    it("should require location for in-person events", () => {
        const errors = validateEventForm({
            ...validForm,
            mode: EVENT_MODES.IN_PERSON,
            location: ""
        });

        expect(errors.location).toBe("Location is required for in-person events");
    });

    it("should not require location for online events", () => {
        const errors = validateEventForm(
            createOnlineEventPayload({
                location: ""
            })
        );

        expect(errors.location).toBeUndefined();
    });

    /* =============================
       DATE / TIME
    ============================= */

    it("should allow past start and end datetime when past dates are allowed", () => {
        const errors = validateEventForm({
            ...validForm,
            startDateTime: "2026-05-19T08:00",
            endDateTime: "2026-05-19T10:00"
        }, {
            allowPastDates: true
        });

        expect(errors.startDateTime).toBeUndefined();
        expect(errors.endDateTime).toBeUndefined();
    });

    it("should still reject end datetime before start datetime when past dates are allowed", () => {
        const errors = validateEventForm({
            ...validForm,
            startDateTime: "2026-05-19T10:00",
            endDateTime: "2026-05-19T08:00"
        }, {
            allowPastDates: true
        });

        expect(errors.endDateTime).toBe(
            "End date and time must be after start date and time"
        );
    });

    it("should reject invalid start datetime", () => {
        const errors = validateEventForm({
            ...validForm,
            startDateTime: "invalid-date"
        });

        expect(errors.startDateTime).toBe("Start date and time must be a valid date");
    });

    it("should reject invalid end datetime", () => {
        const errors = validateEventForm({
            ...validForm,
            endDateTime: "invalid-date"
        });

        expect(errors.endDateTime).toBe("End date and time must be a valid date");
    });

    it("should reject start datetime in the past", () => {
        const errors = validateEventForm({
            ...validForm,
            startDateTime: "2026-05-19T10:00"
        });

        expect(errors.startDateTime).toBe("Start date and time cannot be in the past");
    });

    it("should reject end datetime in the past", () => {
        const errors = validateEventForm({
            ...validForm,
            startDateTime: "2026-05-19T08:00",
            endDateTime: "2026-05-19T10:00"
        });

        expect(errors.endDateTime).toBe("End date and time cannot be in the past");
    });

    it("should reject end datetime before start datetime", () => {
        const errors = validateEventForm({
            ...validForm,
            startDateTime: "2026-12-20T12:00",
            endDateTime: "2026-12-20T10:00"
        });

        expect(errors.endDateTime).toBe("End date and time must be after start date and time");
    });

    it("should reject end datetime equal to start datetime", () => {
        const errors = validateEventForm({
            ...validForm,
            startDateTime: "2026-12-20T10:00",
            endDateTime: "2026-12-20T10:00"
        });

        expect(errors.endDateTime).toBe("End date and time must be after start date and time");
    });

    /* =============================
       PARTICIPANTS / REGISTRATION
    ============================= */

    it("should reject invalid max participants", () => {
        const errors = validateEventForm({
            ...validForm,
            maxParticipants: "abc"
        });

        expect(errors.maxParticipants).toBe("Max participants must be a positive integer");
    });

    it("should reject max participants below 1", () => {
        const errors = validateEventForm({
            ...validForm,
            maxParticipants: "0"
        });

        expect(errors.maxParticipants).toBe("Max participants must be a positive integer");
    });

    it("should reject invalid registration deadline", () => {
        const errors = validateEventForm({
            ...validForm,
            registrationDeadline: "invalid-date"
        });

        expect(errors.registrationDeadline).toBe("Registration deadline must be a valid date");
    });

    it("should reject registration deadline after event start", () => {
        const errors = validateEventForm({
            ...validForm,
            startDateTime: "2026-12-20T10:00",
            registrationDeadline: "2026-12-20T11:00"
        });

        expect(errors.registrationDeadline).toBe("Registration deadline must be before event start date");
    });

    it("should reject registration deadline equal to event start", () => {
        const errors = validateEventForm({
            ...validForm,
            startDateTime: "2026-12-20T10:00",
            registrationDeadline: "2026-12-20T10:00"
        });

        expect(errors.registrationDeadline).toBe("Registration deadline must be before event start date");
    });

    /* =============================
       EVENT IMAGE
    ============================= */

    it("should reject invalid event image type", () => {
        const errors = validateEventForm({
            ...validForm,
            image: invalidImage
        });

        expect(errors.image).toBe("Event image must be an image file");
    });

    it("should reject event image larger than 3MB", () => {
        const errors = validateEventForm({
            ...validForm,
            image: largeImage
        });

        expect(errors.image).toBe("Event image must be less than 3MB");
    });

    /* =============================
       PARTIAL UPDATE
    ============================= */

    it("should allow empty object when partial validation is enabled", () => {
        const errors = validateEventForm(
            {},
            { allowPartial: true }
        );

        expect(errors).toEqual({});
    });

    it("should reject empty provided title when partial validation is enabled", () => {
        const errors = validateEventForm({
            title: ""
        }, {
            allowPartial: true
        });

        expect(errors.title).toBe("Title cannot be empty");
    });

    it("should reject empty provided description when partial validation is enabled", () => {
        const errors = validateEventForm({
            description: ""
        }, {
            allowPartial: true
        });

        expect(errors.description).toBe("Description cannot be empty");
    });
});
