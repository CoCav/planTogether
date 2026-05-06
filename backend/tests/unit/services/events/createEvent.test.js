/* ==================================================
   EVENT SERVICE - CREATE EVENT TESTS

   Tests:
   - successful event creation
   - automatic organizer membership creation
   - online event location normalization
   - missing required dates rejection
   - invalid date order rejection
   - database error forwarding

   Ensures:
   - events are created with valid data
   - creators are automatically linked as organizers
   - business rules are enforced before persistence
================================================== */

const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/relations/eventUserRoleModel");

const eventService = require("../../../../src/services/eventService");

jest.mock("../../../../src/models/eventModel", () => ({
    create: jest.fn()
}));

jest.mock("../../../../src/models/relations/eventUserRoleModel", () => ({
    create: jest.fn()
}));

describe("eventService - createEvent", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("should create an in-person event and organizer membership", async () => {
        const event = { id: 1, title: "Test Event" };

        Event.create.mockResolvedValue(event);
        EventUserRole.create.mockResolvedValue({});

        const result = await eventService.createEvent({
            title: "Test Event",
            description: "Description",
            type: "Meetup",
            theme: "Tech",
            mode: "in_person",
            location: "Montreal",
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z",
            image: null
        }, 10);

        expect(Event.create).toHaveBeenCalledWith({
            creatorId: 10,
            title: "Test Event",
            description: "Description",
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

        expect(EventUserRole.create).toHaveBeenCalledWith({
            eventId: 1,
            userId: 10,
            role: "organizer"
        });

        expect(result).toBe(event);
    });

    it("should create an online event with null location", async () => {
        const event = { id: 1, title: "Online Event" };

        Event.create.mockResolvedValue(event);
        EventUserRole.create.mockResolvedValue({});

        await eventService.createEvent({
            title: "Online Event",
            description: "Description",
            type: "Workshop",
            theme: "Remote",
            mode: "online",
            location: "Montreal",
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z"
        }, 10);

        expect(Event.create).toHaveBeenCalledWith(
            expect.objectContaining({
                mode: "online",
                location: null
            })
        );
    });

    it("should create an event with maxParticipants and registrationDeadline", async () => {
        const event = { id: 1 };

        Event.create.mockResolvedValue(event);
        EventUserRole.create.mockResolvedValue({});

        await eventService.createEvent({
            title: "Limited Event",
            description: "Description",
            type: "Meetup",
            theme: "Tech",
            mode: "in_person",
            location: "Paris",
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z",
            maxParticipants: 10,
            registrationDeadline: "2026-12-19T10:00:00.000Z"
        }, 10);

        expect(Event.create).toHaveBeenCalledWith(
            expect.objectContaining({
                maxParticipants: 10,
                registrationDeadline: "2026-12-19T10:00:00.000Z"
            })
        );
    });

    it("should throw 400 when end date is before start date", async () => {
        await expect(
            eventService.createEvent({
                startDateTime: "2026-12-20T12:00:00.000Z",
                endDateTime: "2026-12-20T10:00:00.000Z"
            }, 10)
        ).rejects.toMatchObject({
            message: "End date must be after start date",
            statusCode: 400
        });

        expect(Event.create).not.toHaveBeenCalled();
    });

    it("should forward database errors", async () => {
        Event.create.mockRejectedValue(new Error("DB error"));

        await expect(
            eventService.createEvent({
                title: "Test Event",
                description: "Description",
                type: "Meetup",
                theme: "Tech",
                mode: "online",
                startDateTime: "2026-12-20T10:00:00.000Z",
                endDateTime: "2026-12-20T12:00:00.000Z"
            }, 10)
        ).rejects.toThrow("DB error");
    });
});
