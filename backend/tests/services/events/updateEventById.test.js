const Event = require("../../../src/models/eventModel");
const { assertEventNotPast } = require("../../../src/utils/eventTime");
const deleteUploadedFile = require("../../../src/utils/deleteUploadedFile");

const eventService = require("../../../src/services/eventService");

/**
 * Event Service - Update Event By ID
 *
 * Tests event update logic.
 *
 * Ensures only valid updates are applied and business rules are enforced.
*/

jest.mock("../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../src/utils/eventTime", () => ({
    assertEventNotPast: jest.fn()
}));

jest.mock("../../../src/utils/deleteUploadedFile", () => jest.fn());

describe("eventService - updateEventById", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("should update an in-person event", async () => {
        const event = {
            id: 1,
            update: jest.fn().mockResolvedValue()
        };

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });

        const result = await eventService.updateEventById(1, {
            title: "Updated Event",
            description: "Updated description",
            type: "Meetup",
            theme: "Tech",
            mode: "in_person",
            location: "Montreal",
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z",
            image: null
        });

        expect(assertEventNotPast).toHaveBeenCalledWith(event);
        expect(event.update).toHaveBeenCalledWith({
            title: "Updated Event",
            description: "Updated description",
            type: "Meetup",
            theme: "Tech",
            mode: "in_person",
            location: "Montreal",
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z",
            maxParticipants: null,
            registrationDeadline: null,
            image: null
        });
        expect(result).toBe(event);
    });

    it("should update online event with null location", async () => {
        const event = {
            id: 1,
            update: jest.fn().mockResolvedValue()
        };

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });

        await eventService.updateEventById(1, {
            title: "Online Event",
            description: "Updated description",
            type: "Workshop",
            theme: "Remote",
            mode: "online",
            location: "Montreal",
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z",
            image: null
        });

        expect(event.update).toHaveBeenCalledWith(
            expect.objectContaining({
                mode: "online",
                location: null
            })
        );
    });

    it("should update maxParticipants and registrationDeadline", async () => {
        const event = {
            id: 1,
            update: jest.fn().mockResolvedValue()
        };

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });

        await eventService.updateEventById(1, {
            title: "Updated",
            description: "Updated",
            type: "Meetup",
            theme: "Tech",
            mode: "in_person",
            location: "Paris",
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z",
            maxParticipants: 10,
            registrationDeadline: "2026-12-19T10:00:00.000Z",
            image: null
        });

        expect(event.update).toHaveBeenCalledWith(
            expect.objectContaining({
                maxParticipants: 10,
                registrationDeadline: "2026-12-19T10:00:00.000Z"
            })
        );
    });

    it("should throw 404 when event is not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(
            eventService.updateEventById(999, {
                title: "Updated Event"
            })
        ).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });
    });

    it("should block update when event is past", async () => {
        const event = {
            id: 1,
            update: jest.fn()
        };

        Event.findByPk.mockResolvedValue(event);

        const error = new Error("No action is allowed on a past event");
        error.statusCode = 403;

        assertEventNotPast.mockImplementation(() => {
            throw error;
        });

        await expect(
            eventService.updateEventById(1, {
                title: "Updated Event"
            })
        ).rejects.toMatchObject({
            message: "No action is allowed on a past event",
            statusCode: 403
        });

        expect(event.update).not.toHaveBeenCalled();
    });

    it("should throw 400 when end date is before start date", async () => {
        const event = {
            id: 1,
            update: jest.fn()
        };

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });

        await expect(
            eventService.updateEventById(1, {
                startDateTime: "2026-12-20T12:00:00.000Z",
                endDateTime: "2026-12-20T10:00:00.000Z"
            })
        ).rejects.toMatchObject({
            message: "End date must be after start date",
            statusCode: 400
        });

        expect(event.update).not.toHaveBeenCalled();
    });

    it("should update event image and delete old image", async () => {
        const event = {
            id: 1,
            image: "/uploads/events/old-event.png",
            update: jest.fn().mockResolvedValue()
        };

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });

        await eventService.updateEventById(1, {
            title: "Updated Event",
            description: "Updated description",
            type: "Meetup",
            theme: "Tech",
            mode: "in_person",
            location: "Montreal",
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z",
            image: "/uploads/events/new-event.png"
        });

        expect(event.update).toHaveBeenCalledWith(
            expect.objectContaining({
                image: "/uploads/events/new-event.png"
            })
        );

        expect(deleteUploadedFile).toHaveBeenCalledWith("/uploads/events/old-event.png");
    });

    it("should keep existing image when no new image is provided", async () => {
        const event = {
            id: 1,
            image: "/uploads/events/current-event.png",
            update: jest.fn().mockResolvedValue()
        };

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });

        await eventService.updateEventById(1, {
            title: "Updated Event"
        });

        expect(event.update).toHaveBeenCalledWith(
            expect.objectContaining({
                image: "/uploads/events/current-event.png"
            })
        );

        expect(deleteUploadedFile).not.toHaveBeenCalled();
    });

    it("should not delete image when new image is same as old image", async () => {
        const event = {
            id: 1,
            image: "/uploads/events/same-event.png",
            update: jest.fn().mockResolvedValue()
        };

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });

        await eventService.updateEventById(1, {
            image: "/uploads/events/same-event.png"
        });

        expect(deleteUploadedFile).not.toHaveBeenCalled();
    });

    it("should forward database errors", async () => {
        Event.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(eventService.updateEventById(1, { title: "Updated Event" })).rejects.toThrow("DB error");
    });
});
