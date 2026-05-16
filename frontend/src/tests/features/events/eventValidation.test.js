import { describe, expect, it } from "vitest";

import { validateEventForm } from "../../../features/events/eventValidation";

import { EVENT_MODES } from "../../../features/shared/eventModes";

/* ==================================================
   EVENT VALIDATION TESTS
   Tests create/edit event form validation

   Handles:
   - required event fields
   - event mode and location rules
   - start/end datetime validation
   - participant limit validation
   - registration deadline validation
   - event image validation
   - partial update validation
================================================== */

describe("eventValidation", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const validImage = new File(
        ["event image"],
        "event.png",
        { type: "image/png" }
    );

    const invalidImage = new File(
        ["event image"],
        "event.txt",
        { type: "text/plain" }
    );

    const largeImage = new File(
        [new Uint8Array(3 * 1024 * 1024 + 1)],
        "large.png",
        { type: "image/png" }
    );

    const validForm = {
        title: "Test Event",
        description: "A test event",
        type: "Meetup",
        theme: "Tech",
        mode: EVENT_MODES.IN_PERSON,
        location: "Montreal",
        startDateTime: "2026-12-20T10:00:00.000Z",
        endDateTime: "2026-12-20T12:00:00.000Z",
        maxParticipants: "",
        registrationDeadline: "",
        image: null
    };

    /* =============================
       VALID FORM
    ============================= */

    it("should return no errors for a valid in-person event", () => {
        expect(validateEventForm(validForm)).toEqual({});
    });

    it("should return no errors for a valid online event without location", () => {
        const errors = validateEventForm({
            ...validForm,
            mode: EVENT_MODES.ONLINE,
            location: ""
        });

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

        expect(errors.location).toBe(
            "Location is required for in-person events"
        );
    });

    it("should not require location for online events", () => {
        const errors = validateEventForm({
            ...validForm,
            mode: EVENT_MODES.ONLINE,
            location: ""
        });

        expect(errors.location).toBeUndefined();
    });

    /* =============================
       DATE / TIME
    ============================= */

    it("should reject invalid start datetime", () => {
        const errors = validateEventForm({
            ...validForm,
            startDateTime: "invalid-date"
        });

        expect(errors.startDateTime).toBe(
            "Start date and time must be a valid date"
        );
    });

    it("should reject invalid end datetime", () => {
        const errors = validateEventForm({
            ...validForm,
            endDateTime: "invalid-date"
        });

        expect(errors.endDateTime).toBe(
            "End date and time must be a valid date"
        );
    });

    it("should reject end datetime before start datetime", () => {
        const errors = validateEventForm({
            ...validForm,
            startDateTime: "2026-12-20T12:00:00.000Z",
            endDateTime: "2026-12-20T10:00:00.000Z"
        });

        expect(errors.endDateTime).toBe(
            "End date and time must be after start date and time"
        );
    });

    it("should reject end datetime equal to start datetime", () => {
        const errors = validateEventForm({
            ...validForm,
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T10:00:00.000Z"
        });

        expect(errors.endDateTime).toBe(
            "End date and time must be after start date and time"
        );
    });

    /* =============================
       PARTICIPANTS / REGISTRATION
    ============================= */

    it("should reject invalid max participants", () => {
        const errors = validateEventForm({
            ...validForm,
            maxParticipants: "abc"
        });

        expect(errors.maxParticipants).toBe(
            "Max participants must be a positive integer"
        );
    });

    it("should reject max participants below 1", () => {
        const errors = validateEventForm({
            ...validForm,
            maxParticipants: "0"
        });

        expect(errors.maxParticipants).toBe(
            "Max participants must be a positive integer"
        );
    });

    it("should reject invalid registration deadline", () => {
        const errors = validateEventForm({
            ...validForm,
            registrationDeadline: "invalid-date"
        });

        expect(errors.registrationDeadline).toBe(
            "Registration deadline must be a valid date"
        );
    });

    it("should reject registration deadline after event start", () => {
        const errors = validateEventForm({
            ...validForm,
            startDateTime: "2026-12-20T10:00:00.000Z",
            registrationDeadline: "2026-12-20T11:00:00.000Z"
        });

        expect(errors.registrationDeadline).toBe(
            "Registration deadline must be before event start date"
        );
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
