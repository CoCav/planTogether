import { describe, expect, it } from "vitest";

import { buildEventFormData, buildEventPayload } from "../../../features/events/eventPayloads";

import { EVENT_MODES } from "../../../features/shared/eventModes";

import {
    createEventPayload,
    createEventPayloadWithEmptyOptionals,
    createEventPayloadWithImage,
    createOnlineEventPayload
} from "../../factories/events/eventPayloadFactory";

/* ==================================================
   EVENT PAYLOAD TESTS
   Tests frontend event payload builders

   Handles:
   - plain event payload creation
   - online location normalization
   - nullable optional fields
   - image field handling
   - FormData payload creation

   Notes:
   - uses reusable event payload factories
================================================== */

describe("eventPayload", () => {

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
        expect(formData.get("startDateTime")).toBe(
            "2026-12-20T10:00:00.000Z"
        );
        expect(formData.get("endDateTime")).toBe(
            "2026-12-20T12:00:00.000Z"
        );
        expect(formData.get("maxParticipants")).toBe("10");
        expect(formData.get("registrationDeadline")).toBe(
            "2026-12-19T12:00:00.000Z"
        );
    });

    it("should convert null values to empty strings in FormData", () => {
        const formData = buildEventFormData(
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
