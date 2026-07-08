/* ==================================================
   EVENT MEMBERSHIP SERVICE - TRANSFER OWNERSHIP TESTS

   Tests:
   - successful ownership transfer to active participant
   - successful ownership transfer to active co_organizer
   - self-transfer rejection
   - inactive target membership rejection
   - target non-member rejection
   - organizer authorization rejection
   - past event rejection
   - missing event rejection
   - transaction rollback on database errors

   Ensures:
   - ownership is transferred atomically
   - only active memberships can receive ownership transfer
   - selected members become organizer
   - previous organizers become co_organizer
   - only organizers can transfer ownership
   - past event rules are respected
   - Sequelize transactions are committed on success
   - Sequelize transactions are rolled back on failures
   - shared event role constants are used for valid role scenarios
================================================== */

jest.mock("../../../../src/config/database", () => ({
    transaction: jest.fn()
}));

jest.mock("../../../../src/models/userModel", () => ({}));

jest.mock("../../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/models/associations/eventUserRoleModel", () => ({
    findOne: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    assertEventNotPast: jest.fn()
}));

const sequelize = require("../../../../src/config/database");
const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/associations/eventUserRoleModel");

const eventMembershipService = require("../../../../src/services/eventMembershipService");

const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");

const { assertEventNotPast } = require("../../../../src/utils/events/eventStatus");

const { createMockMembershipEvent, createMockMembership } = require("../../../factories/eventMembershipFactory");

describe("eventMembershipService - transferEventOwnership", () => {

    let transaction;

    beforeEach(() => {
        jest.clearAllMocks();

        transaction = {
            commit: jest.fn().mockResolvedValue(),
            rollback: jest.fn().mockResolvedValue()
        };

        sequelize.transaction.mockResolvedValue(transaction);
        assertEventNotPast.mockImplementation(() => { });
    });

    /* =============================
       OWNERSHIP TRANSFER SUCCESS
    ============================= */

    it("should transfer ownership to participant", async () => {
        const event = createMockMembershipEvent({ id: 1 });

        const currentOrganizerMembership = createMockMembership({
            eventId: 1,
            userId: 10,
            role: EVENT_ROLES.ORGANIZER,
            save: jest.fn().mockResolvedValue()
        });

        const targetMembership = createMockMembership({
            eventId: 1,
            userId: 20,
            role: EVENT_ROLES.PARTICIPANT,
            save: jest.fn().mockResolvedValue()
        });

        Event.findByPk.mockResolvedValue(event);

        EventUserRole.findOne
            .mockResolvedValueOnce(currentOrganizerMembership)
            .mockResolvedValueOnce(targetMembership);

        const result = await eventMembershipService.transferEventOwnership({
            eventId: 1,
            currentUserId: 10,
            targetUserId: 20
        });

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(assertEventNotPast).toHaveBeenCalledWith(event);

        expect(EventUserRole.findOne).toHaveBeenNthCalledWith(1, {
            where: {
                eventId: 1,
                userId: 10,
                deletedAt: null
            },
            transaction
        });

        expect(EventUserRole.findOne).toHaveBeenNthCalledWith(2, {
            where: {
                eventId: 1,
                userId: 20,
                deletedAt: null
            },
            transaction
        });

        expect(currentOrganizerMembership.role).toBe(EVENT_ROLES.CO_ORGANIZER);
        expect(targetMembership.role).toBe(EVENT_ROLES.ORGANIZER);

        expect(currentOrganizerMembership.save).toHaveBeenCalledWith({ transaction });
        expect(targetMembership.save).toHaveBeenCalledWith({ transaction });

        expect(transaction.commit).toHaveBeenCalled();
        expect(transaction.rollback).not.toHaveBeenCalled();

        expect(result.previousOrganizer).toBe(currentOrganizerMembership);
        expect(result.newOrganizer).toBe(targetMembership);
    });

    it("should transfer ownership to co_organizer", async () => {
        const currentOrganizerMembership = createMockMembership({
            eventId: 1,
            userId: 10,
            role: EVENT_ROLES.ORGANIZER,
            save: jest.fn().mockResolvedValue()
        });

        const targetMembership = createMockMembership({
            eventId: 1,
            userId: 20,
            role: EVENT_ROLES.CO_ORGANIZER,
            save: jest.fn().mockResolvedValue()
        });

        Event.findByPk.mockResolvedValue(createMockMembershipEvent({ id: 1 }));

        EventUserRole.findOne
            .mockResolvedValueOnce(currentOrganizerMembership)
            .mockResolvedValueOnce(targetMembership);

        const result = await eventMembershipService.transferEventOwnership({
            eventId: 1,
            currentUserId: 10,
            targetUserId: 20
        });

        expect(currentOrganizerMembership.role).toBe(EVENT_ROLES.CO_ORGANIZER);
        expect(targetMembership.role).toBe(EVENT_ROLES.ORGANIZER);

        expect(currentOrganizerMembership.save).toHaveBeenCalledWith({ transaction });
        expect(targetMembership.save).toHaveBeenCalledWith({ transaction });

        expect(transaction.commit).toHaveBeenCalled();
        expect(transaction.rollback).not.toHaveBeenCalled();

        expect(result.newOrganizer).toBe(targetMembership);
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should throw 400 when transferring ownership to self", async () => {
        Event.findByPk.mockResolvedValue(createMockMembershipEvent({ id: 1 }));

        await expect(eventMembershipService.transferEventOwnership({
            eventId: 1,
            currentUserId: 10,
            targetUserId: 10
        })).rejects.toMatchObject({
            message: "You cannot transfer ownership to yourself",
            statusCode: 400
        });

        expect(EventUserRole.findOne).not.toHaveBeenCalled();

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    it("should throw 404 when target member is not part of event", async () => {
        const currentOrganizerMembership = createMockMembership({
            eventId: 1,
            userId: 10,
            role: EVENT_ROLES.ORGANIZER
        });

        Event.findByPk.mockResolvedValue(createMockMembershipEvent({ id: 1 }));

        EventUserRole.findOne
            .mockResolvedValueOnce(currentOrganizerMembership)
            .mockResolvedValueOnce(null);

        await expect(eventMembershipService.transferEventOwnership({
            eventId: 1,
            currentUserId: 10,
            targetUserId: 20
        })).rejects.toMatchObject({
            message: "Target member is not part of this event",
            statusCode: 404
        });

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    it("should throw 403 when current user is not organizer", async () => {
        const requesterMembership = createMockMembership({
            eventId: 1,
            userId: 10,
            role: EVENT_ROLES.CO_ORGANIZER
        });

        Event.findByPk.mockResolvedValue(createMockMembershipEvent({ id: 1 }));

        EventUserRole.findOne.mockResolvedValueOnce(requesterMembership);

        await expect(eventMembershipService.transferEventOwnership({
            eventId: 1,
            currentUserId: 10,
            targetUserId: 20
        })).rejects.toMatchObject({
            message: "Only the organizer can transfer event ownership",
            statusCode: 403
        });

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    it("should block ownership transfer for past event", async () => {
        const event = createMockMembershipEvent({ id: 1 });

        Event.findByPk.mockResolvedValue(event);

        const error = new Error("No action is allowed on a past event");
        error.statusCode = 403;

        assertEventNotPast.mockImplementation(() => {
            throw error;
        });

        await expect(eventMembershipService.transferEventOwnership({
            eventId: 1,
            currentUserId: 10,
            targetUserId: 20
        })).rejects.toMatchObject({
            statusCode: 403
        });

        expect(assertEventNotPast).toHaveBeenCalledWith(event);

        expect(EventUserRole.findOne).not.toHaveBeenCalled();

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    it("should reject ownership transfer to inactive membership", async () => {
        const currentOrganizerMembership = createMockMembership({
            eventId: 1,
            userId: 10,
            role: EVENT_ROLES.ORGANIZER
        });

        Event.findByPk.mockResolvedValue(
            createMockMembershipEvent({ id: 1 })
        );

        EventUserRole.findOne
            .mockResolvedValueOnce(currentOrganizerMembership)
            .mockResolvedValueOnce(null);

        await expect(eventMembershipService.transferEventOwnership({
            eventId: 1,
            currentUserId: 10,
            targetUserId: 20
        })).rejects.toMatchObject({
            message: "Target member is not part of this event",
            statusCode: 404
        });

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 if event is not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(eventMembershipService.transferEventOwnership({
            eventId: 1,
            currentUserId: 10,
            targetUserId: 20
        })).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });

        expect(EventUserRole.findOne).not.toHaveBeenCalled();

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should rollback transaction when database error occurs", async () => {
        Event.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(eventMembershipService.transferEventOwnership({
            eventId: 1,
            currentUserId: 10,
            targetUserId: 20
        })).rejects.toThrow("DB error");

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });
});
