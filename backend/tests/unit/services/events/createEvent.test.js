/* ==================================================
   EVENT SERVICE - CREATE EVENT TESTS

   Tests:
   - successful event creation
   - organizer membership creation
   - invalid date order rejection
   - transaction rollback on database errors

   Ensures:
   - events are created with normalized data
   - creators are automatically linked as organizers
   - business rules are validated before persistence
   - Sequelize transactions are committed on success
   - Sequelize transactions are rolled back on failure
   - shared event role constants are used consistently
================================================== */

jest.mock("../../../../src/config/database", () => ({
    transaction: jest.fn()

}));

jest.mock("../../../../src/models/userModel", () => ({}));

jest.mock("../../../../src/models/eventModel", () => ({
    create: jest.fn()
}));

jest.mock("../../../../src/models/relations/eventUserRoleModel", () => ({
    create: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventDataBuilder", () => ({
    buildEventCreateData: jest.fn()
}));

const sequelize = require("../../../../src/config/database");
const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/relations/eventUserRoleModel");

const eventService = require("../../../../src/services/eventService");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");

const { buildEventCreateData } = require("../../../../src/utils/events/eventDataBuilder");

const { createEventPayload } = require("../../../factories/eventFactory");

describe("eventService - createEvent", () => {

    let transaction;

    beforeEach(() => {
        jest.clearAllMocks();

        transaction = {
            commit: jest.fn().mockResolvedValue(),
            rollback: jest.fn().mockResolvedValue()
        };

        sequelize.transaction.mockResolvedValue(transaction);
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

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(buildEventCreateData).toHaveBeenCalledWith(eventInput, 10);

        expect(Event.create).toHaveBeenCalledWith(builtEventData, { transaction });

        expect(EventUserRole.create).toHaveBeenCalledWith({
            eventId: 1,
            userId: 10,
            role: EVENT_ROLES.ORGANIZER
        }, {
            transaction
        });

        expect(transaction.commit).toHaveBeenCalled();
        expect(transaction.rollback).not.toHaveBeenCalled();

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

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();

        expect(buildEventCreateData).not.toHaveBeenCalled();
        expect(Event.create).not.toHaveBeenCalled();
        expect(EventUserRole.create).not.toHaveBeenCalled();
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should forward database errors and rollback transaction", async () => {
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

        await expect(eventService.createEvent(eventInput, 10))
            .rejects
            .toThrow("DB error");

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.create).toHaveBeenCalledWith(builtEventData, { transaction });

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();

        expect(EventUserRole.create).not.toHaveBeenCalled();
    });
});
