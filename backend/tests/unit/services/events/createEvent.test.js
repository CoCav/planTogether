/* ==================================================
   EVENT SERVICE - CREATE EVENT TESTS

   Tests:
   - successful event creation
   - automatic organizer membership creation
   - invalid date order rejection
   - database error forwarding

   Ensures:
   - events are created with normalized data
   - creators are automatically linked as organizers
   - business rules are enforced before persistence
   - database errors are forwarded correctly
================================================== */

const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/relations/eventUserRoleModel");

const eventService = require("../../../../src/services/eventService");

const { buildEventCreateData } = require("../../../../src/utils/events/eventDataBuilder");

const { mockConsoleError } = require("../../../helpers/mocks/consoleMocks");

const { createEventPayload } = require("../../../factories/eventFactory");

jest.mock("../../../../src/models/eventModel", () => ({
    create: jest.fn()
}));

jest.mock("../../../../src/models/relations/eventUserRoleModel", () => ({
    create: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventDataBuilder", () => ({
    buildEventCreateData: jest.fn()
}));

describe("eventService - createEvent", () => {

    mockConsoleError();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       CREATE EVENT SUCCESS
    ============================= */

    it("should create an event and organizer membership", async () => {

        const eventInput = createEventPayload({
            description: "Description",
            theme: "Tech",
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z",
            image: null
        });

        const builtEventData = {
            creatorId: 10,
            ...eventInput,
            maxParticipants: null,
            registrationDeadline: null,
            image: null
        };

        const event = {
            id: 1,
            title: "Test Event"
        };

        buildEventCreateData.mockReturnValue(builtEventData);

        Event.create.mockResolvedValue(event);
        EventUserRole.create.mockResolvedValue({});

        const result = await eventService.createEvent(eventInput, 10);

        expect(buildEventCreateData).toHaveBeenCalledWith(eventInput, 10);

        expect(Event.create).toHaveBeenCalledWith(builtEventData);

        expect(EventUserRole.create).toHaveBeenCalledWith({
            eventId: 1,
            userId: 10,
            role: "organizer"
        });

        expect(result).toBe(event);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

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

        expect(buildEventCreateData).not.toHaveBeenCalled();

        expect(Event.create).not.toHaveBeenCalled();
        expect(EventUserRole.create).not.toHaveBeenCalled();
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should forward database errors", async () => {

        const eventInput = createEventPayload({
            mode: "online",
            description: "Description",
            theme: "Tech",
            startDateTime: "2026-12-20T10:00:00.000Z",
            endDateTime: "2026-12-20T12:00:00.000Z"
        });

        const builtEventData = {
            creatorId: 10,
            title: "Test Event"
        };

        buildEventCreateData.mockReturnValue(builtEventData);

        Event.create.mockRejectedValue(new Error("DB error"));

        await expect(eventService.createEvent(eventInput, 10)).rejects.toThrow("DB error");
    });
});
