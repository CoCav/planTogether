const { authorizeRoleChange, authorizeMemberRemoval } = require("../../src/middlewares/authorizeEvent");

const EventUserRole = require("../../src/models/relations/eventUserRoleModel");
const Event = require("../../src/models/eventModel");

jest.mock("../../src/models/relations/eventUserRoleModel");
jest.mock("../../src/models/eventModel");

const createMocks = ({ eventId = "1", userId = "2", requestingUserId = 1, newRole = "co_organizer" } = {}) => {
    const req = {
        params: { eventId, userId },
        body: { newRole },
        user: { userId: requestingUserId }
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    return { req, res, next };
};

describe("authorizeRoleChange", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 when userId is invalid", async () => {
        const { req, res, next } = createMocks({ userId: "invalid" });

        await authorizeRoleChange(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 when event is not found", async () => {
        const { req, res, next } = createMocks();

        EventUserRole.findOne.mockResolvedValue({ role: "participant" });
        Event.findByPk.mockResolvedValue(null);

        await authorizeRoleChange(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Event not found" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 when target user link is not found", async () => {
        const { req, res, next } = createMocks();

        EventUserRole.findOne.mockResolvedValue(null);
        Event.findByPk.mockResolvedValue({ id: 1, creatorId: 1 });

        await authorizeRoleChange(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User link not found in event" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should prevent changing the event creator role", async () => {
        const { req, res, next } = createMocks({ userId: "1" });

        EventUserRole.findOne.mockResolvedValue({ role: "participant" });
        Event.findByPk.mockResolvedValue({ id: 1, creatorId: 1 });

        await authorizeRoleChange(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "You cannot change the role of the event creator"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should prevent changing organizer role", async () => {
        const { req, res, next } = createMocks();

        EventUserRole.findOne.mockResolvedValue({ role: "organizer" });
        Event.findByPk.mockResolvedValue({ id: 1, creatorId: 1 });

        await authorizeRoleChange(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "Organizer role cannot be changed"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should prevent promoting user to organizer", async () => {
        const { req, res, next } = createMocks({ newRole: "organizer" });

        EventUserRole.findOne.mockResolvedValue({ role: "participant" });
        Event.findByPk.mockResolvedValue({ id: 1, creatorId: 1 });

        await authorizeRoleChange(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "Only one organizer is allowed per event"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should call next when role change is allowed", async () => {
        const { req, res, next } = createMocks();

        EventUserRole.findOne.mockResolvedValue({ role: "participant" });
        Event.findByPk.mockResolvedValue({ id: 1, creatorId: 1 });

        await authorizeRoleChange(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it("should return 500 on unexpected error", async () => {
        const { req, res, next } = createMocks();

        EventUserRole.findOne.mockRejectedValue(new Error("DB error"));

        await authorizeRoleChange(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
        expect(next).not.toHaveBeenCalled();
    });
});

describe("authorizeMemberRemoval", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 when userId is invalid", async () => {
        const { req, res, next } = createMocks({ userId: "invalid" });

        await authorizeMemberRemoval(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 when event is not found", async () => {
        const { req, res, next } = createMocks();

        EventUserRole.findOne
            .mockResolvedValueOnce({ role: "organizer" })
            .mockResolvedValueOnce({ role: "participant" });

        Event.findByPk.mockResolvedValue(null);

        await authorizeMemberRemoval(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Event not found" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 when one user link is missing", async () => {
        const { req, res, next } = createMocks();

        EventUserRole.findOne
            .mockResolvedValueOnce({ role: "organizer" })
            .mockResolvedValueOnce(null);

        Event.findByPk.mockResolvedValue({ id: 1, creatorId: 1 });

        await authorizeMemberRemoval(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "User link not found in event" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should prevent removing the event creator", async () => {
        const { req, res, next } = createMocks({ userId: "1" });

        EventUserRole.findOne
            .mockResolvedValueOnce({ role: "organizer" })
            .mockResolvedValueOnce({ role: "participant" });

        Event.findByPk.mockResolvedValue({ id: 1, creatorId: 1 });

        await authorizeMemberRemoval(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "You cannot remove the event creator"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should prevent removing organizer", async () => {
        const { req, res, next } = createMocks({ userId: "2" });

        EventUserRole.findOne
            .mockResolvedValueOnce({ role: "organizer" })
            .mockResolvedValueOnce({ role: "organizer" });

        Event.findByPk.mockResolvedValue({ id: 1, creatorId: 1 });

        await authorizeMemberRemoval(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "Organizer cannot be removed from the event"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should prevent self-removal through admin route", async () => {
        const { req, res, next } = createMocks({
            userId: "1",
            requestingUserId: 1
        });

        EventUserRole.findOne
            .mockResolvedValueOnce({ role: "co_organizer" })
            .mockResolvedValueOnce({ role: "participant" });

        Event.findByPk.mockResolvedValue({ id: 1, creatorId: 99 });

        await authorizeMemberRemoval(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "You cannot remove yourself from the event"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should prevent co-organizer from removing non-participant", async () => {
        const { req, res, next } = createMocks();

        EventUserRole.findOne
            .mockResolvedValueOnce({ role: "co_organizer" })
            .mockResolvedValueOnce({ role: "co_organizer" });

        Event.findByPk.mockResolvedValue({ id: 1, creatorId: 1 });

        await authorizeMemberRemoval(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "Co-organizers can only remove participants"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should call next when removal is allowed for organizer", async () => {
        const { req, res, next } = createMocks();

        EventUserRole.findOne
            .mockResolvedValueOnce({ role: "organizer" })
            .mockResolvedValueOnce({ role: "participant" });

        Event.findByPk.mockResolvedValue({ id: 1, creatorId: 1 });

        await authorizeMemberRemoval(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it("should call next when co-organizer removes participant", async () => {
        const { req, res, next } = createMocks();

        EventUserRole.findOne
            .mockResolvedValueOnce({ role: "co_organizer" })
            .mockResolvedValueOnce({ role: "participant" });

        Event.findByPk.mockResolvedValue({ id: 1, creatorId: 1 });

        await authorizeMemberRemoval(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it("should return 500 on unexpected error", async () => {
        const { req, res, next } = createMocks();

        EventUserRole.findOne.mockRejectedValue(new Error("DB error"));

        await authorizeMemberRemoval(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
        expect(next).not.toHaveBeenCalled();
    });
});