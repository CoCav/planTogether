import { describe, expect, it } from "vitest";

import {
    buildEventFormData,
    buildEventFormPayload,
    buildEventFormPayloadData,
    buildEventPayload,
    buildEventUpdateFormData,
    buildEventUpdateFormPayloadData,
    buildRegistrationDeadline
} from "../../../../features/events/form/eventPayloadBuilder";

import { EVENT_MODES } from "../../../../features/shared/constants/eventModes";
import { EVENT_REGISTRATION_DEADLINES } from "../../../../features/shared/constants/eventRegistrationDeadlines";

import {
    createEventPayload,
    createEventPayloadWithEmptyOptionals,
    createEventPayloadWithImage,
    createOnlineEventPayload
} from "../../../factories/events/eventPayloadFactory";

/* ==================================================
   EVENT PAYLOAD BUILDER TESTS
   Tests frontend event payload builders

   Handles:
   - registration deadline resolution
   - form payload creation
   - plain event payload creation
   - online location normalization
   - nullable optional fields
   - image field handling
   - unchanged image omission
   - explicit image clearing in update payloads
   - create FormData payload creation
   - update FormData field clearing

   Notes:
   - uses reusable event payload factories
   - event forms use datetime-local values
   - update payloads distinguish unchanged and cleared images
================================================== */

describe("eventPayloadBuilder", () => {

    /* =============================
       REGISTRATION DEADLINE
    ============================= */

    it("should return null when registration deadline option is none", () => {
        expect(
            buildRegistrationDeadline({
                startDateTime: "2026-12-20T10:00",
                registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.NONE
            })
        ).toBeNull();
    });

    it("should build registration deadline one day before event start", () => {
        expect(
            buildRegistrationDeadline({
                startDateTime: "2026-12-20T10:00",
                registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.DAY_BEFORE
            })
        ).toBe(new Date("2026-12-19T10:00").toISOString());
    });

    it("should build registration deadline two days before event start", () => {
        expect(
            buildRegistrationDeadline({
                startDateTime: "2026-12-20T10:00",
                registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.TWO_DAYS_BEFORE
            })
        ).toBe(new Date("2026-12-18T10:00").toISOString());
    });

    it("should build custom registration deadline", () => {
        expect(
            buildRegistrationDeadline({
                startDateTime: "2026-12-20T10:00",
                registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.CUSTOM,
                registrationDeadlineCustom: "2026-12-19T12:00"
            })
        ).toBe(new Date("2026-12-19T12:00").toISOString());
    });

    it("should return null when event start datetime is missing or invalid", () => {
        expect(buildRegistrationDeadline()).toBeNull();

        expect(
            buildRegistrationDeadline({
                startDateTime: "invalid-date",
                registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.DAY_BEFORE
            })
        ).toBeNull();
    });

    /* =============================
       FORM PAYLOAD
    ============================= */

    it("should build event form payload from form values", () => {
        const values = {
            title: "Test Event",
            description: "A test event",
            type: "Meetup",
            theme: "Tech",
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",
            startDateTime: "2026-12-20T10:00",
            endDateTime: "2026-12-20T12:00",
            maxParticipants: "10",
            registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.CUSTOM,
            registrationDeadlineCustom: "2026-12-19T12:00",
            image: null
        };

        expect(buildEventFormPayload(values)).toEqual({
            title: "Test Event",
            description: "A test event",
            type: "Meetup",
            theme: "Tech",
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",
            startDateTime: "2026-12-20T10:00",
            endDateTime: "2026-12-20T12:00",
            maxParticipants: "10",
            registrationDeadline: new Date("2026-12-19T12:00").toISOString(),
            image: null
        });
    });

    it("should set registration deadline to null when no deadline option is selected", () => {
        const payload = buildEventFormPayload({
            title: "Test Event",
            mode: EVENT_MODES.IN_PERSON,
            startDateTime: "2026-12-20T10:00",
            endDateTime: "2026-12-20T12:00",
            registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.NONE
        });

        expect(payload.registrationDeadline).toBeNull();
    });

    /* =============================
       EVENT PAYLOAD
    ============================= */

    it("should build a plain event payload", () => {
        const eventData = createEventPayload();

        expect(buildEventPayload(eventData)).toEqual(eventData);
    });

    it("should normalize online event location to null", () => {
        const payload = buildEventPayload(
            createOnlineEventPayload({
                location: "Montreal"
            })
        );

        expect(payload.location).toBeNull();
    });

    it("should keep location for in-person events", () => {
        const payload = buildEventPayload(
            createEventPayload({
                mode: EVENT_MODES.IN_PERSON,
                location: "Montreal"
            })
        );

        expect(payload.location).toBe("Montreal");
    });

    it("should normalize empty in-person location to null", () => {
        const payload = buildEventPayload(
            createEventPayload({
                location: ""
            })
        );

        expect(payload.location).toBeNull();
    });

    it("should normalize empty optional fields to null", () => {
        const payload = buildEventPayload(
            createEventPayloadWithEmptyOptionals()
        );

        expect(payload.maxParticipants).toBeNull();
        expect(payload.registrationDeadline).toBeNull();
    });

    it("should omit image when image is undefined", () => {
        const payload = buildEventPayload(
            createEventPayload({
                image: undefined
            })
        );

        expect(payload.image).toBeUndefined();
    });

    it("should preserve null image value for update clearing", () => {
        const payload = buildEventPayload(
            createEventPayload({
                image: null
            })
        );

        expect(payload.image).toBeNull();
    });

    /* =============================
       FORM DATA PAYLOAD
    ============================= */

    it("should build FormData from event payload", () => {
        const formData = buildEventFormData(
            createEventPayload()
        );

        expect(formData.get("title")).toBe("Test Event");
        expect(formData.get("description")).toBe("A test event");
        expect(formData.get("type")).toBe("Meetup");
        expect(formData.get("theme")).toBe("Tech");
        expect(formData.get("mode")).toBe(EVENT_MODES.IN_PERSON);
        expect(formData.get("location")).toBe("Montreal");
        expect(formData.get("startDateTime")).toBe("2026-12-20T10:00");
        expect(formData.get("endDateTime")).toBe("2026-12-20T12:00");
        expect(formData.get("maxParticipants")).toBe("10");
        expect(formData.get("registrationDeadline")).toBe(
            "2026-12-19T12:00"
        );
    });

    it("should build FormData directly from event form values", () => {
        const formData = buildEventFormPayloadData({
            title: "Test Event",
            description: "A test event",
            type: "Meetup",
            theme: "Tech",
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",
            startDateTime: "2026-12-20T10:00",
            endDateTime: "2026-12-20T12:00",
            maxParticipants: "10",
            registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.CUSTOM,
            registrationDeadlineCustom: "2026-12-19T12:00",
            image: null
        });

        expect(formData.get("title")).toBe("Test Event");
        expect(formData.get("startDateTime")).toBe("2026-12-20T10:00");
        expect(formData.get("endDateTime")).toBe("2026-12-20T12:00");
        expect(formData.get("registrationDeadline")).toBe(
            new Date("2026-12-19T12:00").toISOString()
        );
    });

    it("should build update FormData directly from event form values", () => {
        const formData = buildEventUpdateFormPayloadData({
            title: "Test Event",
            description: "A test event",
            type: "Meetup",
            theme: "Tech",
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",
            startDateTime: "2026-12-20T10:00",
            endDateTime: "2026-12-20T12:00",
            maxParticipants: "",
            registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.NONE,
            image: null
        });

        expect(formData.get("title")).toBe("Test Event");
        expect(formData.get("maxParticipants")).toBe("");
        expect(formData.get("registrationDeadline")).toBe("");
    });

    it("should send removed image as empty string in update FormData", () => {
        const formData = buildEventUpdateFormData(
            createEventPayload({
                image: null
            })
        );

        expect(formData.get("image")).toBe("");
    });

    it("should skip undefined image in update FormData", () => {
        const formData = buildEventUpdateFormData(
            createEventPayload({
                image: undefined
            })
        );

        expect(formData.has("image")).toBe(false);
    });

    it("should omit null optional values from FormData", () => {
        const formData = buildEventFormData(
            createEventPayloadWithEmptyOptionals({
                mode: EVENT_MODES.ONLINE,
                location: "Montreal"
            })
        );

        expect(formData.has("location")).toBe(false);
        expect(formData.has("maxParticipants")).toBe(false);
        expect(formData.has("registrationDeadline")).toBe(false);
    });

    it("should send null optional values as empty strings in update FormData", () => {
        const formData = buildEventUpdateFormData(
            createEventPayloadWithEmptyOptionals({
                mode: EVENT_MODES.ONLINE,
                location: "Montreal"
            })
        );

        expect(formData.get("location")).toBe("");
        expect(formData.get("maxParticipants")).toBe("");
        expect(formData.get("registrationDeadline")).toBe("");
    });

    it("should skip undefined values in FormData", () => {
        const formData = buildEventFormData(
            createEventPayload({
                image: undefined
            })
        );

        expect(formData.has("image")).toBe(false);
    });

    it("should append image file to FormData when provided", () => {
        const eventData = createEventPayloadWithImage();

        const formData = buildEventFormData(eventData);

        expect(formData.get("image")).toBe(eventData.image);
    });
});
