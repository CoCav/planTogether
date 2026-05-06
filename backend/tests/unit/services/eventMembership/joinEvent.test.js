/* ==================================================
   EVENT MEMBERSHIP SERVICE - JOIN EVENT TESTS

   Tests:
   - successful event join
   - missing event rejection
   - duplicate membership rejection
   - past event rejection
   - full event rejection
   - closed registration rejection

   Ensures:
   - users can join only valid events
   - participant limits are enforced
   - registration deadlines are enforced
   - past event rules are respected
================================================== */

const Event = require("../../../../src/models/eventModel");
const EventUserRole = require("../../../../src/models/relations/eventUserRoleModel");
const { assertEventNotPast } = require("../../../../src/utils/eventStatus");

const service = require("../../../../src/services/eventMembershipService");

jest.mock("../../../../src/models/eventModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../src/models/relations/eventUserRoleModel", () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    count: jest.fn()
}));

jest.mock("../../../../src/utils/eventStatus", () => ({
    assertEventNotPast: jest.fn()
}));

describe("eventMembershipService - joinEvent", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    it("should join event as participant", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });

        EventUserRole.findOne.mockResolvedValue(null);

        EventUserRole.create.mockResolvedValue({
            eventId: 1,
            userId: 10,
            role: "participant"
        });

        const result = await service.joinEvent({
            eventId: 1,
            userId: 10
        });

        expect(assertEventNotPast).toHaveBeenCalled();

        expect(EventUserRole.create).toHaveBeenCalledWith({
            eventId: 1,
            userId: 10,
            role: "participant"
        });

        expect(result.role).toBe("participant");
    });

    it("should throw 404 if event is not found", async () => {
        Event.findByPk.mockResolvedValue(null);

        await expect(
            service.joinEvent({ eventId: 1, userId: 10 })
        ).rejects.toMatchObject({
            message: "Event not found",
            statusCode: 404
        });
    });

    it("should throw 409 if user already joined", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });

        EventUserRole.findOne.mockResolvedValue({ id: 1 });

        await expect(
            service.joinEvent({ eventId: 1, userId: 10 })
        ).rejects.toMatchObject({
            statusCode: 409
        });

        expect(EventUserRole.create).not.toHaveBeenCalled();
    });

    it("should block joining a past event", async () => {
        Event.findByPk.mockResolvedValue({ id: 1 });

        const error = new Error("No action is allowed on a past event");
        error.statusCode = 403;

        assertEventNotPast.mockImplementation(() => {
            throw error;
        });

        await expect(service.joinEvent({ eventId: 1, userId: 10 })).rejects.toMatchObject({ statusCode: 403 });
    });

    it("should throw 409 if event is full", async () => {
        assertEventNotPast.mockImplementation(() => { });

        Event.findByPk.mockResolvedValue({
            id: 1,
            maxParticipants: 1,
            registrationDeadline: null
        });

        EventUserRole.findOne.mockResolvedValue(null);
        EventUserRole.count.mockResolvedValue(1);

        await expect(
            service.joinEvent({ eventId: 1, userId: 10 })
        ).rejects.toMatchObject({
            message: "Event has reached maximum number of participants",
            statusCode: 409
        });
    });

    it("should throw 409 if registration is closed", async () => {
        assertEventNotPast.mockImplementation(() => { });

        Event.findByPk.mockResolvedValue({
            id: 1,
            maxParticipants: null,
            registrationDeadline: new Date(Date.now() - 1000)
        });

        EventUserRole.findOne.mockResolvedValue(null);

        await expect(
            service.joinEvent({ eventId: 1, userId: 10 })
        ).rejects.toMatchObject({
            message: "Registration period is over for this event",
            statusCode: 409
        });
    });
});
