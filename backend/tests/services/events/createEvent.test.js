const Event = require("../../../src/models/eventModel");
const EventUserRole = require("../../../src/models/relations/eventUserRoleModel");

const eventService = require("../../../src/services/eventService");

/**
 * Event Service - Create Event
 *
 * Tests event creation logic.
 *
 * Ensures events are created with valid data and organizer is assigned.
*/

jest.mock("../../../src/models/eventModel", () => ({
    create: jest.fn()
}));

jest.mock("../../../src/models/relations/eventUserRoleModel", () => ({
    create: jest.fn()
}));

describe("eventService - createEvent", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("should create an in-person event and assign organizer role", async () => {
        const event = { id: 1, title: "Test Event" };

        Event.create.mockResolvedValue(event);
        EventUserRole.create.mockResolvedValue({});

        const result = await eventService.createEvent(
            {
                title: "Test Event",
                description: "Description",
                startDateTime: "2026-12-20T10:00:00.000Z",
                endDateTime: "2026-12-20T12:00:00.000Z",
                mode: "in_person",
                location: "Montreal",
                type: "Meetup",
                theme: "Tech"
            },
            10
        );

        expect(Event.create).toHaveBeenCalledWith({
            title: "Test Event",
            description: "Description",
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z",
            mode: "in_person",
            location: "Montreal",
            type: "Meetup",
            theme: "Tech",
            creatorId: 10
        });

        expect(EventUserRole.create).toHaveBeenCalledWith({
            eventId: 1,
            userId: 10,
            role: "organizer"
        });

        expect(result).toBe(event);
    });

    it("should create an online event with null location", async () => {
        const event = { id: 2, title: "Online Event" };

        Event.create.mockResolvedValue(event);
        EventUserRole.create.mockResolvedValue({});

        await eventService.createEvent(
            {
                title: "Online Event",
                description: "Description",
                startDateTime: "2026-12-20T10:00:00.000Z",
                endDateTime: "2026-12-20T12:00:00.000Z",
                mode: "online",
                location: "Should be ignored",
                type: "Workshop",
                theme: "Remote"
            },
            10
        );

        expect(Event.create).toHaveBeenCalledWith(
            expect.objectContaining({
                mode: "online",
                location: null
            })
        );
    });

    it("should throw 400 when end date is before start date", async () => {
        await expect(
            eventService.createEvent(
                {
                    title: "Invalid Event",
                    description: "Description",
                    startDateTime: "2026-12-20T12:00:00.000Z",
                    endDateTime: "2026-12-20T10:00:00.000Z",
                    mode: "in_person",
                    location: "Montreal",
                    type: "Meetup",
                    theme: "Tech"
                },
                10
            )
        ).rejects.toMatchObject({
            message: "End date must be after start date",
            statusCode: 400
        });

        expect(Event.create).not.toHaveBeenCalled();
        expect(EventUserRole.create).not.toHaveBeenCalled();
    });

    it("should rethrow creation errors", async () => {
        Event.create.mockRejectedValue(new Error("DB error"));

        await expect(
            eventService.createEvent(
                {
                    title: "Test Event",
                    description: "Description",
                    startDateTime: "2026-12-20T10:00:00.000Z",
                    endDateTime: "2026-12-20T12:00:00.000Z",
                    mode: "in_person",
                    location: "Montreal",
                    type: "Meetup",
                    theme: "Tech"
                },
                10
            )
        ).rejects.toThrow("DB error");
    });
});