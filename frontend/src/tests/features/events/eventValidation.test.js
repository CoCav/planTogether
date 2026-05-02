import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { validateEventForm } from "../../../features/events/eventValidation";

/* ==================================================
   EVENT VALIDATION TESTS
   Tests create/edit event form validation
================================================== */

const validImage = new File(["event image"], "event.png", {
    type: "image/png"
});

const invalidImage = new File(["event image"], "event.txt", {
    type: "text/plain"
});

const largeImage = new File(
    [new Uint8Array(3 * 1024 * 1024 + 1)],
    "large.png",
    { type: "image/png" }
);

const validForm = {
    title: "Test Event",
    type: "Meetup",
    theme: "Tech",
    description: "A test event",
    startDate: "2026-12-20",
    startTime: "10:00",
    endDate: "2026-12-20",
    endTime: "12:00",
    mode: "in_person",
    location: "Montreal",
    image: null,
    currentImage: null
};

describe("eventValidation", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-04-25T12:00:00"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should return no errors for a valid in-person event", () => {
        expect(validateEventForm(validForm)).toEqual({});
    });

    it("should return no errors for a valid event with image", () => {
        expect(validateEventForm({
            ...validForm,
            image: validImage
        })).toEqual({});
    });

    it("should require main text fields", () => {
        const errors = validateEventForm({
            ...validForm,
            title: "",
            type: "",
            theme: "",
            description: ""
        });

        expect(errors).toMatchObject({
            title: "Title is required",
            type: "Type is required",
            theme: "Theme is required",
            description: "Description is required"
        });
    });

    it("should require date and time fields", () => {
        const errors = validateEventForm({
            ...validForm,
            startDate: "",
            startTime: "",
            endDate: "",
            endTime: ""
        });

        expect(errors).toMatchObject({
            startDate: "Start date is required",
            startTime: "Start time is required",
            endDate: "End date is required",
            endTime: "End time is required"
        });
    });

    it("should reject start date in the past", () => {
        const errors = validateEventForm({
            ...validForm,
            startDate: "2026-04-24",
            startTime: "10:00",
            endDate: "2026-04-24",
            endTime: "12:00"
        });

        expect(errors.startDate).toBe("Start date cannot be in the past");
    });

    it("should reject start time in the past when date is today", () => {
        const errors = validateEventForm({
            ...validForm,
            startDate: "2026-04-25",
            startTime: "10:00",
            endDate: "2026-04-25",
            endTime: "12:00"
        });

        expect(errors.startTime).toBe("Start time cannot be in the past");
    });

    it("should allow past start when allowPastStart is true", () => {
        const errors = validateEventForm(
            {
                ...validForm,
                startDate: "2026-04-24",
                startTime: "10:00",
                endDate: "2026-04-24",
                endTime: "12:00"
            },
            { allowPastStart: true }
        );

        expect(errors.startDate).toBeUndefined();
    });

    it("should reject end date before start date", () => {
        const errors = validateEventForm({
            ...validForm,
            startDate: "2026-12-20",
            endDate: "2026-12-19"
        });

        expect(errors.endDate).toBe("End date must be after start date");
    });

    it("should reject end time before or equal to start time on same day", () => {
        const errors = validateEventForm({
            ...validForm,
            startDate: "2026-12-20",
            startTime: "10:00",
            endDate: "2026-12-20",
            endTime: "10:00"
        });

        expect(errors.endTime).toBe("End time must be after start time");
    });

    it("should require location for in-person events", () => {
        const errors = validateEventForm({
            ...validForm,
            mode: "in_person",
            location: ""
        });

        expect(errors.location).toBe("Location is required for in-person events");
    });

    it("should not require location for online events", () => {
        const errors = validateEventForm({
            ...validForm,
            mode: "online",
            location: ""
        });

        expect(errors.location).toBeUndefined();
    });

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
});
