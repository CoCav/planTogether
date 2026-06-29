/* ==================================================
   EVENT SERVICE - UPDATE EVENT BY ID TESTS

   Tests:
   - successful event update
   - partial update field preservation
   - event image replacement
   - event image removal
   - image preservation when omitted
   - event geolocation resolution
   - online event geolocation bypass
   - empty in-person location rejection
   - invalid date order rejection
   - past event update rejection
   - missing event rejection
   - transaction rollback on database errors

   Ensures:
   - event updates are applied through normalized update data
   - partial updates preserve omitted fields
   - images can be preserved, replaced or removed
   - old images are deleted only after successful DB commit
   - location-aware event updates
   - location provider calls are skipped when not needed
   - in-person events cannot be updated with an empty location
   - past event rules are enforced
   - Sequelize transactions are committed on successful updates
   - Sequelize transactions are rolled back on failed updates
================================================== */

jest.mock("../../../../src/config/database", () => ({
    transaction: jest.fn()
}));

jest.mock("../../../../src/models/userModel", () => ({}));

jest.mock("../../../../src/models/relations/eventUserRoleModel", () => ({}));

jest.mock("../../../../src/models/relations/eventReviewModel", () => ({
    name: "EventReviewModel"
}));

jest.mock("../../../../src/models/relations/eventLikeModel", () => ({
    findOne: jest.fn(),
    count: jest.fn()
}));

jest.mock("../../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/services/locationService", () => ({
    resolveEventLocation: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventDataBuilder", () => ({
    buildEventUpdateData: jest.fn()
}));

jest.mock("../../../../src/utils/events/eventStatus", () => ({
    assertEventNotPast: jest.fn()
}));

jest.mock("../../../../src/utils/files/uploadedFileStorage", () => ({
    deleteUploadedFile: jest.fn()
}));

const sequelize = require("../../../../src/config/database");
const Event = require("../../../../src/models/eventModel");

const eventService = require("../../../../src/services/eventService");
const locationService = require("../../../../src/services/locationService");

const { EVENT_MODES } = require("../../../../src/constants/eventModes");

const { buildEventUpdateData } = require("../../../../src/utils/events/eventDataBuilder");
const { assertEventNotPast } = require("../../../../src/utils/events/eventStatus");
const { deleteUploadedFile } = require("../../../../src/utils/files/uploadedFileStorage");

const { createMockEventModel } = require("../../../factories/eventFactory");

describe("eventService - updateEventByID", () => {

    let transaction;

    beforeEach(() => {
        jest.clearAllMocks();

        transaction = {
            commit: jest.fn().mockResolvedValue(),
            rollback: jest.fn().mockResolvedValue()
        };

        sequelize.transaction.mockResolvedValue(transaction);

        locationService.resolveEventLocation.mockResolvedValue({
            latitude: 46.8137431,
            longitude: -71.2084061,
            label: "Québec, Canada"
        });
    });

    /* =============================
       EVENT UPDATE SUCCESS
    ============================= */

    it("should update event successfully", async () => {
        const event = createMockEventModel({
            id: 1,
            image: null,
            update: jest.fn().mockResolvedValue()
        });

        const updateData = createMockEventModel({
            title: "Updated Event"
        });

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });
        buildEventUpdateData.mockReturnValue(updateData);

        const result = await eventService.updateEventByID(1, {
            title: "Updated Event"
        });

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(assertEventNotPast).toHaveBeenCalledWith(event);

        expect(buildEventUpdateData).toHaveBeenCalledWith(event, {
            title: "Updated Event"
        }, null);

        expect(event.update).toHaveBeenCalledWith(updateData, { transaction });

        expect(transaction.commit).toHaveBeenCalled();
        expect(transaction.rollback).not.toHaveBeenCalled();

        expect(deleteUploadedFile).not.toHaveBeenCalled();

        expect(result).toBe(event);
    });

    it("should preserve existing fields when partial update data is omitted", async () => {
        const event = createMockEventModel({
            id: 1,
            image: "/uploads/events/current-event.png",
            maxParticipants: 20,
            registrationDeadline: "2026-12-19T10:00:00.000Z",
            update: jest.fn().mockResolvedValue()
        });

        const updateData = createMockEventModel({
            title: "Updated Event",
            image: "/uploads/events/current-event.png"
        });

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });
        buildEventUpdateData.mockReturnValue(updateData);

        await eventService.updateEventByID(1, {
            title: "Updated Event"
        });

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(buildEventUpdateData).toHaveBeenCalledWith(event, {
            title: "Updated Event"
        }, null);

        expect(event.update).toHaveBeenCalledWith(updateData, { transaction });

        expect(transaction.commit).toHaveBeenCalled();
        expect(transaction.rollback).not.toHaveBeenCalled();

        expect(deleteUploadedFile).not.toHaveBeenCalled();
    });

    it("should replace event image and delete previous image", async () => {
        const event = createMockEventModel({
            id: 1,
            image: "/uploads/events/old-event.png",
            update: jest.fn().mockResolvedValue()
        });

        const updateData = createMockEventModel({
            image: "/uploads/events/new-event.png"
        });

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });
        buildEventUpdateData.mockReturnValue(updateData);

        await eventService.updateEventByID(1, {
            image: "/uploads/events/new-event.png"
        });

        expect(buildEventUpdateData).toHaveBeenCalledWith(event, {
            image: "/uploads/events/new-event.png"
        }, null);

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.findByPk).toHaveBeenCalledWith(1, { transaction });
        expect(event.update).toHaveBeenCalledWith(updateData, { transaction });

        expect(transaction.commit).toHaveBeenCalled();
        expect(transaction.rollback).not.toHaveBeenCalled();

        expect(deleteUploadedFile).toHaveBeenCalledWith("/uploads/events/old-event.png");
    });

    it("should remove event image and delete previous image", async () => {
        const event = createMockEventModel({
            id: 1,
            image: "/uploads/events/old-event.png",
            update: jest.fn().mockResolvedValue()
        });

        const updateData = createMockEventModel({
            image: null
        });

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });
        buildEventUpdateData.mockReturnValue(updateData);

        await eventService.updateEventByID(1, {
            image: null
        });

        expect(buildEventUpdateData).toHaveBeenCalledWith(event, {
            image: null
        }, null);

        expect(event.update).toHaveBeenCalledWith(updateData, { transaction });

        expect(transaction.commit).toHaveBeenCalled();

        expect(deleteUploadedFile).toHaveBeenCalledWith("/uploads/events/old-event.png");
    });

    it("should resolve location data when updating physical event location", async () => {
        const event = createMockEventModel({
            id: 1,
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",
            image: null,
            update: jest.fn().mockResolvedValue()
        });

        const updateData = {
            location: "Quebec City",
            latitude: 46.8137431,
            longitude: -71.2084061,
            locationLabel: "Québec, Canada"
        };

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });
        buildEventUpdateData.mockReturnValue(updateData);

        await eventService.updateEventByID(1, {
            location: "Quebec City"
        });

        expect(locationService.resolveEventLocation).toHaveBeenCalledWith("Quebec City");

        expect(buildEventUpdateData).toHaveBeenCalledWith(event, {
            location: "Quebec City"
        }, {
            latitude: 46.8137431,
            longitude: -71.2084061,
            label: "Québec, Canada"
        });

        expect(event.update).toHaveBeenCalledWith(updateData, { transaction });
    });

    it("should not resolve location data when location is omitted", async () => {
        const event = createMockEventModel({
            id: 1,
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",
            image: null,
            update: jest.fn().mockResolvedValue()
        });

        const updateData = {
            title: "Updated Event"
        };

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });
        buildEventUpdateData.mockReturnValue(updateData);

        await eventService.updateEventByID(1, {
            title: "Updated Event"
        });

        expect(event.update).toHaveBeenCalledWith(updateData, { transaction });

        expect(locationService.resolveEventLocation).not.toHaveBeenCalled();

        expect(buildEventUpdateData).toHaveBeenCalledWith(event, {
            title: "Updated Event"
        }, null);
    });

    it("should not resolve location data when updating event to online mode", async () => {
        const event = createMockEventModel({
            id: 1,
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",
            image: null,
            update: jest.fn().mockResolvedValue()
        });

        const updateData = {
            mode: EVENT_MODES.ONLINE,
            location: null,
            latitude: null,
            longitude: null,
            locationLabel: null
        };

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });
        buildEventUpdateData.mockReturnValue(updateData);

        await eventService.updateEventByID(1, {
            mode: EVENT_MODES.ONLINE
        });

        expect(locationService.resolveEventLocation).not.toHaveBeenCalled();

        expect(buildEventUpdateData).toHaveBeenCalledWith(event, {
            mode: EVENT_MODES.ONLINE
        }, null);

        expect(event.update).toHaveBeenCalledWith(updateData, { transaction });
    });

    it("should reject empty location for in-person event update", async () => {
        const event = createMockEventModel({
            id: 1,
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",
            image: null,
            update: jest.fn()
        });

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });

        await expect(eventService.updateEventByID(1, {
            location: ""
        })).rejects.toMatchObject({
            message: "Location is required for in-person events",
            statusCode: 400
        });

        expect(locationService.resolveEventLocation).not.toHaveBeenCalled();
        expect(buildEventUpdateData).not.toHaveBeenCalled();
        expect(event.update).not.toHaveBeenCalled();

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should throw 400 when end date is before start date", async () => {
        const event = createMockEventModel({
            id: 1,
            update: jest.fn()
        });

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });

        await expect(eventService.updateEventByID(1, {
            startDateTime: "2026-12-20T12:00:00.000Z",
            endDateTime: "2026-12-20T10:00:00.000Z"
        })).rejects.toMatchObject({
            message: "End date must be after start date",
            statusCode: 400
        });

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.findByPk).toHaveBeenCalledWith(1, { transaction });
        expect(assertEventNotPast).toHaveBeenCalledWith(event);

        expect(buildEventUpdateData).not.toHaveBeenCalled();
        expect(event.update).not.toHaveBeenCalled();

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();

        expect(deleteUploadedFile).not.toHaveBeenCalled();
    });

    it("should block update if event is past", async () => {
        const event = createMockEventModel({
            id: 1,
            update: jest.fn()
        });

        Event.findByPk.mockResolvedValue(event);

        const error = new Error("No action is allowed on a past event");
        error.statusCode = 403;

        assertEventNotPast.mockImplementation(() => {
            throw error;
        });

        await expect(eventService.updateEventByID(1, {
            title: "Updated Event"
        })).rejects.toMatchObject({
            message: "No action is allowed on a past event",
            statusCode: 403
        });

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.findByPk).toHaveBeenCalledWith(1, { transaction });
        expect(assertEventNotPast).toHaveBeenCalledWith(event);

        expect(buildEventUpdateData).not.toHaveBeenCalled();
        expect(event.update).not.toHaveBeenCalled();

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();

        expect(deleteUploadedFile).not.toHaveBeenCalled();
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 when event is not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(eventService.updateEventByID(999, {
            title: "Updated Event"
        })).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(Event.findByPk).toHaveBeenCalledWith(999, { transaction });

        expect(buildEventUpdateData).not.toHaveBeenCalled();

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();

        expect(deleteUploadedFile).not.toHaveBeenCalled();
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should forward database errors and rollback transaction", async () => {
        const event = createMockEventModel({
            id: 1,
            image: null,
            update: jest.fn().mockRejectedValue(new Error("DB error"))
        });

        Event.findByPk.mockResolvedValue(event);

        assertEventNotPast.mockImplementation(() => { });

        buildEventUpdateData.mockReturnValue({
            title: "Updated Event"
        });

        await expect(eventService.updateEventByID(1, {
            title: "Updated Event"
        })).rejects.toThrow("DB error");

        expect(sequelize.transaction).toHaveBeenCalled();

        expect(buildEventUpdateData).toHaveBeenCalledWith(event, {
            title: "Updated Event"
        }, null);

        expect(event.update).toHaveBeenCalledWith({
            title: "Updated Event"
        }, { transaction });

        expect(Event.findByPk).toHaveBeenCalledWith(1, { transaction });

        expect(transaction.rollback).toHaveBeenCalled();
        expect(transaction.commit).not.toHaveBeenCalled();

        expect(deleteUploadedFile).not.toHaveBeenCalled();
    });
});
