/* ==================================================
   AUTHORIZE EVENT ROLE MIDDLEWARE TESTS

   Tests:
   - allowed role authorization
   - membership query parameters
   - missing event ID rejection
   - missing membership rejection
   - insufficient role rejection
   - unexpected database error handling

   Ensures:
   - event role permissions are enforced
   - membership is attached to req when authorized
   - next() is called only for allowed roles
   - unexpected errors return a safe server response
================================================== */

const EventUserRole = require("../../../src/models/relations/eventUserRoleModel");

const authorizeEventRole = require("../../../src/middlewares/authorizeEventRole");
const { EVENT_ROLES } = require("../../../src/constants/eventRoles");

const { createEventRoleMocks } = require("../../helpers/express/mockExpress");
const { mockConsoleError } = require("../../helpers/mocks/consoleMocks");

jest.mock("../../../src/models/relations/eventUserRoleModel", () => ({
    findOne: jest.fn()
}));

describe("authorizeEventRole middleware", () => {

    mockConsoleError();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       AUTHORIZATION SUCCESS
    ============================= */

    it("should attach membership and call next when role is allowed", async () => {
        const { req, res, next } = createEventRoleMocks();

        const membership = {
            eventId: 1,
            userId: 1,
            role: EVENT_ROLES.ORGANIZER
        };

        EventUserRole.findOne.mockResolvedValue(membership);

        const middleware = authorizeEventRole([EVENT_ROLES.ORGANIZER]);

        await middleware(req, res, next);

        expect(req.eventMembership).toEqual(membership);
        expect(next).toHaveBeenCalled();
    });

    it("should query membership with eventId and userId", async () => {
        const { req, res, next } = createEventRoleMocks({
            eventId: "42",
            userId: 7
        });

        EventUserRole.findOne.mockResolvedValue({
            role: EVENT_ROLES.CO_ORGANIZER
        });

        const middleware = authorizeEventRole([EVENT_ROLES.CO_ORGANIZER]);

        await middleware(req, res, next);

        expect(EventUserRole.findOne).toHaveBeenCalledWith({
            where: {
                eventId: "42",
                userId: 7
            }
        });
    });

    /* =============================
       AUTHORIZATION ERRORS
    ============================= */

    it("should return 403 when membership is not found", async () => {
        const { req, res, next } = createEventRoleMocks();

        EventUserRole.findOne.mockResolvedValue(null);

        const middleware = authorizeEventRole([EVENT_ROLES.ORGANIZER]);

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Forbidden: insufficient event role"
        });

        expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 when role is not allowed", async () => {
        const { req, res, next } = createEventRoleMocks();

        EventUserRole.findOne.mockResolvedValue({
            role: EVENT_ROLES.PARTICIPANT
        });

        const middleware = authorizeEventRole([
            EVENT_ROLES.ORGANIZER,
            EVENT_ROLES.CO_ORGANIZER
        ]);

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Forbidden: insufficient event role"
        });

        expect(next).not.toHaveBeenCalled();
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should return 400 when eventId is missing", async () => {
        const { req, res, next } = createEventRoleMocks({
            eventId: null
        });

        const middleware = authorizeEventRole([EVENT_ROLES.ORGANIZER]);

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Event ID is required"
        });

        expect(next).not.toHaveBeenCalled();
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should return 500 on unexpected database error", async () => {
        const { req, res, next } = createEventRoleMocks();

        EventUserRole.findOne.mockRejectedValue(new Error("DB error"));

        const middleware = authorizeEventRole([EVENT_ROLES.ORGANIZER]);

        await middleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: "Internal server error"
        });

        expect(next).not.toHaveBeenCalled();
    });
});
