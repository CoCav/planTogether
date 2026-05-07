/* ==================================================
   AUTHORIZE EVENT ROLE MIDDLEWARE TESTS

   Tests:
   - missing event ID rejection
   - missing membership rejection
   - insufficient role rejection
   - allowed role authorization
   - membership query parameters
   - unexpected database errors

   Ensures:
   - event role permissions are enforced
   - membership is attached to req when authorized
   - next() is called only for allowed roles
================================================== */

const authorizeEventRole = require("../../../src/middlewares/authorizeEventRole");
const EventUserRole = require("../../../src/models/relations/eventUserRoleModel");

const { createMockReqResNext } = require("../../helpers/mockExpress");

jest.mock("../../../src/models/relations/eventUserRoleModel", () => ({
    findOne: jest.fn()
}));

const createEventRoleMocks = ({ eventId = "1", userId = 1 } = {}) => {
    return createMockReqResNext({
        params: { eventId },
        user: { userId }
    });
};

describe("authorizeEventRole middleware", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 400 when eventId is missing", async () => {
        const { req, res, next } = createEventRoleMocks({ eventId: null });

        const middleware = authorizeEventRole(["organizer"]);

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: "Event ID is required" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 when membership is not found", async () => {
        const { req, res, next } = createEventRoleMocks();

        EventUserRole.findOne.mockResolvedValue(null);

        const middleware = authorizeEventRole(["organizer"]);

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: "Forbidden: insufficient event role" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 when role is not allowed", async () => {
        const { req, res, next } = createEventRoleMocks();

        EventUserRole.findOne.mockResolvedValue({ role: "participant" });

        const middleware = authorizeEventRole(["organizer", "co_organizer"]);

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            message: "Forbidden: insufficient event role"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should attach membership and call next when role is allowed", async () => {
        const { req, res, next } = createEventRoleMocks();

        const membership = {
            eventId: 1,
            userId: 1,
            role: "organizer"
        };

        EventUserRole.findOne.mockResolvedValue(membership);

        const middleware = authorizeEventRole(["organizer"]);

        await middleware(req, res, next);

        expect(req.eventMembership).toEqual(membership);
        expect(next).toHaveBeenCalled();
    });

    it("should query membership with eventId and userId", async () => {
        const { req, res, next } = createEventRoleMocks({
            eventId: "42",
            userId: 7
        });

        EventUserRole.findOne.mockResolvedValue({ role: "co_organizer" });

        const middleware = authorizeEventRole(["co_organizer"]);

        await middleware(req, res, next);

        expect(EventUserRole.findOne).toHaveBeenCalledWith({
            where: {
                eventId: "42",
                userId: 7
            }
        });
    });

    it("should return 500 on unexpected error", async () => {
        const { req, res, next } = createEventRoleMocks();

        jest.spyOn(console, "error").mockImplementation(() => { });
        EventUserRole.findOne.mockRejectedValue(new Error("DB error"));

        const middleware = authorizeEventRole(["organizer"]);

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
        expect(next).not.toHaveBeenCalled();

        console.error.mockRestore();
    });
});
