/* ==================================================
   EVENT SERVICE - DELETE EVENT BY ID TESTS

   Tests:
   - successful event deletion
   - membership cleanup before event deletion
   - event image cleanup after successful DB commit
   - started event deletion rejection
   - missing event rejection
   - transaction rollback on database errors

   Ensures:
   - events can be deleted only when allowed
   - related memberships are deleted with the event
   - event image files are deleted only after successful DB commit
   - started event deletion rules are enforced
   - Sequelize transactions are committed on successful deletions
   - Sequelize transactions are rolled back on failed deletions
================================================== */

jest.mock("../../../../src/config/database", () => ({
    transaction: jest.fn()
}));

jest.mock("../../../../src/models/userModel", () => ({}));

jest.mock("../../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/models/relations/eventUserRoleModel", () => ({
    destroy: jest.fn()
}));

jest.mock("../../../../src/services/locationService", () => ({
    resolveEventLocation: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    assertEventNotPast: jest.fn(),
    assertEventNotStarted: jest.fn(),
    hasEventStarted: jest.fn(),
    getEventStatus: jest.fn()
}));

jest.mock("../../../../src/utils/files/uploadedFileStorage", () => ({
    deleteUploadedFile: jest.fn()
}));

const sequelize = require("../../../../src/config/database");
const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/relations/eventUserRoleModel");

const eventService = require("../../../../src/services/eventService");

const { assertEventNotStarted } = require("../../../../src/utils/events/eventStatus");
const { deleteUploadedFile } = require("../../../../src/utils/files/uploadedFileStorage");

const { createMockEventModel } = require("../../../factories/eventFactory");

describe("eventService - deleteEventByID", () => {
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
       EVENT DELETION SUCCESS
    ============================= */

    it("should delete event and related memberships", async () => {
        const event = createMockEventModel({
            id: 1,
            image: null,
            destroy: jest.fn().mockResolvedValue()
        });

        Event.findByPk.mockResolvedValue(event);
        assertEventNotStarted.mockImplementation(() => { });
        EventUserRole.destroy.mockResolvedValue(1);

        await eventService.deleteEventByID(1);

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(assertEventNotStarted).toHaveBeenCalledWith(event);

        expect(EventUserRole.destroy).toHaveBeenCalledWith({
            where: { eventId: 1 },
            transaction
        });

        expect(event.destroy).toHaveBeenCalledWith({ transaction });

        expect(transaction.commit).toHaveBeenCalled();
        expect(transaction.rollback).not.toHaveBeenCalled();

        expect(deleteUploadedFile).not.toHaveBeenCalled();
    });

    it("should delete event image after successful DB commit", async () => {
        const event = createMockEventModel({
            id: 1,
            image: "/uploads/events/event-image.png",
            destroy: jest.fn().mockResolvedValue()
        });

        Event.findByPk.mockResolvedValue(event);
        assertEventNotStarted.mockImplementation(() => { });
        EventUserRole.destroy.mockResolvedValue(1);

        await eventService.deleteEventByID(1);

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(assertEventNotStarted).toHaveBeenCalledWith(event);

        expect(EventUserRole.destroy).toHaveBeenCalledWith({
            where: { eventId: 1 },
            transaction
        });

        expect(event.destroy).toHaveBeenCalledWith({ transaction });

        expect(transaction.commit).toHaveBeenCalled();
        expect(transaction.rollback).not.toHaveBeenCalled();

        expect(deleteUploadedFile).toHaveBeenCalledWith(
            "/uploads/events/event-image.png"
        );
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should block deletion if event has already started", async () => {
        const event = createMockEventModel({
            id: 1,
            image: null,
            destroy: jest.fn()
        });

        Event.findByPk.mockResolvedValue(event);

        const error = new Error("An event that has already started cannot be deleted");
        error.statusCode = 403;

        assertEventNotStarted.mockImplementation(() => {
            throw error;
        });

        await expect(eventService.deleteEventByID(1)).rejects.toMatchObject({
            message: "An event that has already started cannot be deleted",
            statusCode: 403
        });

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(assertEventNotStarted).toHaveBeenCalledWith(event);

        expect(EventUserRole.destroy).not.toHaveBeenCalled();
        expect(event.destroy).not.toHaveBeenCalled();

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();

        expect(deleteUploadedFile).not.toHaveBeenCalled();
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 when event is not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(eventService.deleteEventByID(999)).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.findByPk).toHaveBeenCalledWith(999, { transaction });

        expect(assertEventNotStarted).not.toHaveBeenCalled();
        expect(EventUserRole.destroy).not.toHaveBeenCalled();

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();

        expect(deleteUploadedFile).not.toHaveBeenCalled();
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should rollback transaction when database error occurs", async () => {
        Event.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(eventService.deleteEventByID(1)).rejects.toThrow("DB error");

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();

        expect(deleteUploadedFile).not.toHaveBeenCalled();
    });
});
