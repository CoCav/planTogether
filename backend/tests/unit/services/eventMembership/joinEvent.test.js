/* ==================================================
   EVENT MEMBERSHIP SERVICE - JOIN EVENT TESTS

   Tests:
   - successful event join
   - active membership duplicate rejection
   - inactive membership restoration
   - past event rejection
   - closed registration rejection
   - participant limit enforcement
   - missing event rejection
   - transaction rollback on database errors

   Ensures:
   - users can join only valid events
   - duplicate active memberships are prevented
   - inactive memberships can be restored
   - participant limits only count active participants
   - registration deadlines are enforced
   - past event rules are respected
   - missing events are rejected before membership creation
   - Sequelize transactions are committed on successful joins
   - Sequelize transactions are rolled back on failed joins
   - shared event role constants are used for valid role scenarios
================================================== */

jest.mock("../../../../src/config/database", () => ({
    transaction: jest.fn()
}));

jest.mock("../../../../src/models/userModel", () => ({}));

jest.mock("../../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/models/relations/eventUserRoleModel", () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    assertEventNotPast: jest.fn()
}));

const sequelize = require("../../../../src/config/database");
const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/relations/eventUserRoleModel");

const eventMembershipService = require("../../../../src/services/eventMembershipService");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");

const { assertEventNotPast } = require("../../../../src/utils/events/eventStatus");

const { mockConsoleError } = require("../../../helpers/mocks/consoleMocks");

const { createMockMembershipEvent, createMockMembership } = require("../../../factories/eventMembershipFactory");

describe("eventMembershipService - joinEvent", () => {

    let transaction;

    mockConsoleError();

    beforeEach(() => {
        jest.clearAllMocks();

        transaction = {
            commit: jest.fn().mockResolvedValue(),
            rollback: jest.fn().mockResolvedValue()
        };

        sequelize.transaction.mockResolvedValue(transaction);
    });

    /* =============================
       JOIN SUCCESS
    ============================= */

    it("should join event as participant", async () => {

        Event.findByPk.mockResolvedValue(createMockMembershipEvent({ id: 1 }));

        EventUserRole.findOne.mockResolvedValue(null);

        EventUserRole.create.mockResolvedValue(
            createMockMembership({
                eventId: 1,
                userId: 10,
                role: EVENT_ROLES.PARTICIPANT
            })
        );

        const result = await eventMembershipService.joinEvent({
            eventId: 1,
            userId: 10
        });

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(assertEventNotPast).toHaveBeenCalled();

        expect(EventUserRole.findOne).toHaveBeenCalledWith({
            where: {
                eventId: 1,
                userId: 10
            },
            transaction
        });

        expect(EventUserRole.create).toHaveBeenCalledWith({
            eventId: 1,
            userId: 10,
            role: EVENT_ROLES.PARTICIPANT
        }, {
            transaction
        });

        expect(transaction.commit).toHaveBeenCalled();
        expect(transaction.rollback).not.toHaveBeenCalled();

        expect(result.role).toBe(EVENT_ROLES.PARTICIPANT);
    });

    /* =============================
      BUSINESS RULES
    ============================= */

    it("should throw 409 if user already joined", async () => {

        Event.findByPk.mockResolvedValue(createMockMembershipEvent({ id: 1 }));

        EventUserRole.findOne.mockResolvedValue(
            createMockMembership({
                eventId: 1,
                userId: 10,
                role: EVENT_ROLES.PARTICIPANT,
                deletedAt: null
            })
        );

        await expect(eventMembershipService.joinEvent({
            eventId: 1,
            userId: 10
        })).rejects.toMatchObject({
            statusCode: 409
        });

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(EventUserRole.create).not.toHaveBeenCalled();

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    it("should block joining a past event", async () => {

        const event = createMockMembershipEvent({ id: 1 });

        Event.findByPk.mockResolvedValue(event);

        const error = new Error("No action is allowed on a past event");
        error.statusCode = 403;

        assertEventNotPast.mockImplementation(() => {
            throw error;
        });

        await expect(eventMembershipService.joinEvent({
            eventId: 1,
            userId: 10
        })).rejects.toMatchObject({
            statusCode: 403
        });

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(assertEventNotPast).toHaveBeenCalledWith(event);

        expect(EventUserRole.create).not.toHaveBeenCalled();

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    it("should throw 409 if registration is closed", async () => {

        assertEventNotPast.mockImplementation(() => { });

        Event.findByPk.mockResolvedValue(
            createMockMembershipEvent({
                id: 1,
                maxParticipants: null,
                registrationDeadline: new Date(Date.now() - 1000)
            })
        );

        EventUserRole.findOne.mockResolvedValue(null);

        await expect(eventMembershipService.joinEvent({
            eventId: 1,
            userId: 10
        })).rejects.toMatchObject({
            message: "Registration period is over for this event",
            statusCode: 409
        });

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    it("should not check participant count when maxParticipants is null", async () => {

        Event.findByPk.mockResolvedValue(
            createMockMembershipEvent({
                id: 1,
                maxParticipants: null,
                registrationDeadline: null
            })
        );

        EventUserRole.findOne.mockResolvedValue(null);

        EventUserRole.create.mockResolvedValue(
            createMockMembership({
                eventId: 1,
                userId: 10,
                role: EVENT_ROLES.PARTICIPANT
            })
        );

        await eventMembershipService.joinEvent({
            eventId: 1,
            userId: 10
        });

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(EventUserRole.count).not.toHaveBeenCalled();

        expect(transaction.commit).toHaveBeenCalled();
        expect(transaction.rollback).not.toHaveBeenCalled();
    });

    it("should throw 409 if event is full", async () => {

        assertEventNotPast.mockImplementation(() => { });

        Event.findByPk.mockResolvedValue(
            createMockMembershipEvent({
                id: 1,
                maxParticipants: 1,
                registrationDeadline: null,
                deletedAt: null
            })
        );

        EventUserRole.findOne.mockResolvedValue(null);

        EventUserRole.count.mockResolvedValue(1);

        await expect(eventMembershipService.joinEvent({
            eventId: 1,
            userId: 10
        })).rejects.toMatchObject({
            message: "Event has reached maximum number of participants",
            statusCode: 409
        });

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(EventUserRole.count).toHaveBeenCalledWith({
            where: {
                eventId: 1,
                role: EVENT_ROLES.PARTICIPANT,
                deletedAt: null
            },
            transaction
        });

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    it("should restore inactive membership instead of creating a new one", async () => {

        const inactiveMembership = {
            ...createMockMembership({
                eventId: 1,
                userId: 10,
                role: EVENT_ROLES.CO_ORGANIZER,
                deletedAt: new Date()
            }),
            save: jest.fn().mockResolvedValue()
        };

        Event.findByPk.mockResolvedValue(
            createMockMembershipEvent({ id: 1 })
        );

        EventUserRole.findOne.mockResolvedValue(inactiveMembership);

        const result = await eventMembershipService.joinEvent({
            eventId: 1,
            userId: 10
        });

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(EventUserRole.create).not.toHaveBeenCalled();

        expect(inactiveMembership.deletedAt).toBeNull();
        expect(inactiveMembership.role).toBe(EVENT_ROLES.PARTICIPANT);

        expect(inactiveMembership.save).toHaveBeenCalledWith({
            transaction
        });

        expect(transaction.commit).toHaveBeenCalled();
        expect(transaction.rollback).not.toHaveBeenCalled();

        expect(result).toBe(inactiveMembership);
    });

    /* =============================
      EDGE CASES
    ============================= */

    it("should throw 404 if event is not found", async () => {

        Event.findByPk.mockResolvedValue(null);

        await expect(eventMembershipService.joinEvent({
            eventId: 1,
            userId: 10
        })).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(EventUserRole.create).not.toHaveBeenCalled();

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    /* =============================
      DATABASE ERRORS
    ============================= */

    it("should rollback transaction when database error occurs", async () => {

        Event.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(eventMembershipService.joinEvent({
            eventId: 1,
            userId: 10
        })).rejects.toThrow("DB error");

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });
});
