/* ==================================================
   AUTHORIZE EVENT ROLE MIDDLEWARE TESTS

   Tests:
   - allowed active role authorization
   - active membership query parameters
   - missing event ID error forwarding
   - missing membership error forwarding
   - insufficient role error forwarding
   - unexpected database error forwarding

   Ensures:
   - event role permissions are enforced for active memberships only
   - inactive memberships are ignored
   - membership is attached to req when authorized
   - next() is called without error only for allowed roles
   - authorization errors are forwarded to the global errorHandler
================================================== */

const EventUserRole = require("../../../../src/models/associations/eventUserRoleModel");

const authorizeEventRole = require("../../../../src/middlewares/authorization/authorizeEventRole");
const { EVENT_ROLES } = require("../../../../src/constants/eventRoles");

const { createEventRoleMocks } = require("../../../helpers/express/mockExpress");

jest.mock("../../../../src/models/associations/eventUserRoleModel", () => ({
    findOne: jest.fn()
}));

describe("authorizeEventRole middleware", () => {

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
        expect(next).toHaveBeenCalledWith();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it("should query active membership with eventId and userId", async () => {
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
                userId: 7,
                deletedAt: null
            }
        });

        expect(next).toHaveBeenCalledWith();
    });

    /* =============================
       AUTHORIZATION ERRORS
    ============================= */

    it("should forward 403 when membership is not found", async () => {
        const { req, res, next } = createEventRoleMocks();

        EventUserRole.findOne.mockResolvedValue(null);

        const middleware = authorizeEventRole([EVENT_ROLES.ORGANIZER]);

        await middleware(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 403,
            message: "Forbidden: insufficient event role"
        }));

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it("should forward 403 when role is not allowed", async () => {
        const { req, res, next } = createEventRoleMocks();

        EventUserRole.findOne.mockResolvedValue({
            role: EVENT_ROLES.PARTICIPANT
        });

        const middleware = authorizeEventRole([
            EVENT_ROLES.ORGANIZER,
            EVENT_ROLES.CO_ORGANIZER
        ]);

        await middleware(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 403,
            message: "Forbidden: insufficient event role"
        }));

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should forward 400 when eventId is missing", async () => {
        const { req, res, next } = createEventRoleMocks({
            eventId: null
        });

        const middleware = authorizeEventRole([EVENT_ROLES.ORGANIZER]);

        await middleware(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.objectContaining({
            statusCode: 400,
            message: "Event ID is required"
        }));

        expect(EventUserRole.findOne).not.toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should forward unexpected database errors", async () => {
        const { req, res, next } = createEventRoleMocks();

        const error = new Error("DB error");

        EventUserRole.findOne.mockRejectedValue(error);

        const middleware = authorizeEventRole([EVENT_ROLES.ORGANIZER]);

        await middleware(req, res, next);

        expect(next).toHaveBeenCalledWith(error);

        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});
