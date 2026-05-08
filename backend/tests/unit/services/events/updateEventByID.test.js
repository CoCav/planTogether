/* ==================================================
   EVENT SERVICE - UPDATE EVENT BY ID TESTS

   Tests:
   - successful event update
   - partial update field preservation
   - event image replacement
   - invalid date order rejection
   - past event update rejection
   - missing event rejection
   - database error forwarding

   Ensures:
   - event updates are applied through normalized update data
   - partial updates preserve omitted fields
   - old images are deleted only when replaced
   - past event rules are enforced
   - database errors are forwarded correctly
================================================== */

const Event = require("../../../../src/models/eventModel");

const eventService = require("../../../../src/services/eventService");

const { assertEventNotPast } = require("../../../../src/utils/eventStatus");
const { deleteUploadedFile } = require("../../../../src/utils/uploadedFileStorage");
const { buildEventUpdateData } = require("../../../../src/utils/eventDataBuilder");

const { mockConsoleError } = require("../../../helpers/mocks/consoleMocks");

jest.mock("../../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/utils/eventStatus", () => ({
    assertEventNotPast: jest.fn()
}));

jest.mock("../../../../src/utils/uploadedFileStorage", () => ({
    deleteUploadedFile: jest.fn()
}));

jest.mock("../../../../src/utils/eventDataBuilder", () => ({
    buildEventUpdateData: jest.fn()
}));

describe("eventService - updateEventByID", () => {

    mockConsoleError();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       EVENT UPDATE SUCCESS
    ============================= */

    it("should update event successfully", async () => {
        const event = {
            id: 1,
            image: null,
            update: jest.fn().mockResolvedValue()
        };

        const updateData = {
            title: "Updated Event"
        };

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });
        buildEventUpdateData.mockReturnValue(updateData);

        const result = await eventService.updateEventByID(1, {
            title: "Updated Event"
        });

        expect(assertEventNotPast).toHaveBeenCalledWith(event);

        expect(buildEventUpdateData).toHaveBeenCalledWith(event, {
            title: "Updated Event"
        });

        expect(event.update).toHaveBeenCalledWith(updateData);

        expect(result).toBe(event);
    });

    it("should preserve existing fields when partial update data is omitted", async () => {
        const event = {
            id: 1,
            image: "/uploads/events/current-event.png",
            maxParticipants: 20,
            registrationDeadline: "2026-12-19T10:00:00.000Z",
            update: jest.fn().mockResolvedValue()
        };

        const updateData = {
            title: "Updated Event",
            image: "/uploads/events/current-event.png"
        };

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });
        buildEventUpdateData.mockReturnValue(updateData);

        await eventService.updateEventByID(1, {
            title: "Updated Event"
        });

        expect(buildEventUpdateData).toHaveBeenCalledWith(event, {
            title: "Updated Event"
        });

        expect(event.update).toHaveBeenCalledWith(updateData);

        expect(deleteUploadedFile).not.toHaveBeenCalled();
    });

    it("should replace event image and delete previous image", async () => {
        const event = {
            id: 1,
            image: "/uploads/events/old-event.png",
            update: jest.fn().mockResolvedValue()
        };

        const updateData = {
            image: "/uploads/events/new-event.png"
        };

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });
        buildEventUpdateData.mockReturnValue(updateData);

        await eventService.updateEventByID(1, {
            image: "/uploads/events/new-event.png"
        });

        expect(event.update).toHaveBeenCalledWith(updateData);

        expect(deleteUploadedFile).toHaveBeenCalledWith("/uploads/events/old-event.png");
    });

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should throw 400 when end date is before start date", async () => {
        const event = {
            id: 1,
            update: jest.fn()
        };

        Event.findByPk.mockResolvedValue(event);
        assertEventNotPast.mockImplementation(() => { });

        await expect(eventService.updateEventByID(1, {
            startDateTime: "2026-12-20T12:00:00.000Z",
            endDateTime: "2026-12-20T10:00:00.000Z"
        })).rejects.toMatchObject({
            message: "End date must be after start date",
            statusCode: 400
        });

        expect(buildEventUpdateData).not.toHaveBeenCalled();
        expect(event.update).not.toHaveBeenCalled();
    });

    it("should block update if event is past", async () => {
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

        await expect(eventService.updateEventByID(1, {
            title: "Updated Event"
        })).rejects.toMatchObject({
            message: "No action is allowed on a past event",
            statusCode: 403
        });

        expect(buildEventUpdateData).not.toHaveBeenCalled();
        expect(event.update).not.toHaveBeenCalled();
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

        expect(buildEventUpdateData).not.toHaveBeenCalled();
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should forward database errors", async () => {
        Event.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(eventService.updateEventByID(1, {
            title: "Updated Event"
        })).rejects.toThrow("DB error");
    });
});
