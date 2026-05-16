import { describe, expect, it } from "vitest";

import { buildEventFormData, buildEventPayload } from "../../../features/events/eventPayloads";

import { EVENT_MODES } from "../../../features/shared/eventModes";

/* ==================================================
   EVENT PAYLOAD TESTS
   Tests frontend event payload builders

   Handles:
   - plain event payload creation
   - online location normalization
   - nullable optional fields
   - image field handling
   - FormData payload creation
================================================== */

describe("eventPayload", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const baseEventData = {
        title: "Test Event",
        description: "A test event",
        type: "Meetup",
        theme: "Tech",
        mode: EVENT_MODES.IN_PERSON,
        location: "Montreal",
        startDateTime: "2026-12-20T10:00:00.000Z",
        endDateTime: "2026-12-20T12:00:00.000Z",
        maxParticipants: "10",
        registrationDeadline: "2026-12-19T12:00:00.000Z",
        image: undefined
    };

    /* =============================
       EVENT PAYLOAD
    ============================= */

    it("should build a plain event payload", () => {
        expect(buildEventPayload(baseEventData)).toEqual({
            title: "Test Event",
            description: "A test event",
            type: "Meetup",
            theme: "Tech",
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z",
            maxParticipants: "10",
            registrationDeadline: "2026-12-19T12:00:00.000Z",
            image: undefined
        });
    });

    it("should normalize online event location to null", () => {
        const payload = buildEventPayload({
            ...baseEventData,
            mode: EVENT_MODES.ONLINE,
            location: "Montreal"
        });

        expect(payload.location).toBeNull();
    });

    it("should normalize empty in-person location to null", () => {
        const payload = buildEventPayload({
            ...baseEventData,
            location: ""
        });

        expect(payload.location).toBeNull();
    });

    it("should normalize empty optional fields to null", () => {
        const payload = buildEventPayload({
            ...baseEventData,
            maxParticipants: "",
            registrationDeadline: ""
        });

        expect(payload.maxParticipants).toBeNull();
        expect(payload.registrationDeadline).toBeNull();
    });

    it("should omit image when image is undefined", () => {
        const payload = buildEventPayload({
            ...baseEventData,
            image: undefined
        });

        expect(payload.image).toBeUndefined();
    });

    /* =============================
       FORM DATA PAYLOAD
    ============================= */

    it("should build FormData from event payload", () => {
        const formData = buildEventFormData(baseEventData);

        expect(formData.get("title")).toBe("Test Event");
        expect(formData.get("description")).toBe("A test event");
        expect(formData.get("type")).toBe("Meetup");
        expect(formData.get("theme")).toBe("Tech");
        expect(formData.get("mode")).toBe(EVENT_MODES.IN_PERSON);
        expect(formData.get("location")).toBe("Montreal");
        expect(formData.get("startDateTime")).toBe("2026-12-20T10:00:00.000Z");
        expect(formData.get("endDateTime")).toBe("2026-12-20T12:00:00.000Z");
        expect(formData.get("maxParticipants")).toBe("10");
        expect(formData.get("registrationDeadline")).toBe("2026-12-19T12:00:00.000Z");
    });

    it("should convert null values to empty strings in FormData", () => {
        const formData = buildEventFormData({
            ...baseEventData,
            mode: EVENT_MODES.ONLINE,
            location: "Montreal",
            maxParticipants: "",
            registrationDeadline: ""
        });

        expect(formData.get("location")).toBe("");
        expect(formData.get("maxParticipants")).toBe("");
        expect(formData.get("registrationDeadline")).toBe("");
    });

    it("should skip undefined values in FormData", () => {
        const formData = buildEventFormData({
            ...baseEventData,
            image: undefined
        });

        expect(formData.has("image")).toBe(false);
    });

    it("should append image file to FormData when provided", () => {
        const image = new File(
            ["event image"],
            "event.png",
            { type: "image/png" }
        );

        const formData = buildEventFormData({
            ...baseEventData,
            image
        });

        expect(formData.get("image")).toBe(image);
    });
});
