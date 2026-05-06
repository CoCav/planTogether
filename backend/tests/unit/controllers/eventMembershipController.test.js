/* ==================================================
   EVENT MEMBERSHIP CONTROLLER TESTS

   Tests:
   - joining events
   - leaving events
   - retrieving authenticated user's events
   - retrieving members and organizers
   - updating member roles
   - removing members

   Ensures:
   - controller calls service correctly
   - HTTP responses are properly formatted
   - route params and user payload are passed correctly
   - errors are forwarded to next()
================================================== */

const eventMermbershipController = require("../../../src/controllers/eventMembershipController");
const eventMembershipService = require("../../../src/services/eventMembershipService");

jest.mock("../../../src/services/eventMembershipService");

// Create mocked Express request/response objects
const createMocks = ({ params = { eventId: "1", userId: "2" }, query = {}, body = {}, user = { userId: 10 } } = {}) => {
    const req = { params, query, body, user };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    return { req, res, next };
};

describe("eventMembershipController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       JOIN / LEAVE EVENTS
    ============================= */

    describe("joinEvent", () => {
        it("should join an event", async () => {
            const { req, res, next } = createMocks();
            const membership = { eventId: "1", userId: 10, role: "participant" };

            eventMembershipService.joinEvent.mockResolvedValue(membership);

            await eventMermbershipController.joinEvent(req, res, next);

            expect(eventMembershipService.joinEvent).toHaveBeenCalledWith({
                eventId: "1",
                userId: 10
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User successfully joined the event",
                membership
            });
        });

        it("should forward join errors to next", async () => {
            const { req, res, next } = createMocks();
            const error = new Error("Join failed");

            eventMembershipService.joinEvent.mockRejectedValue(error);

            await eventMermbershipController.joinEvent(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("leaveEvent", () => {
        it("should leave an event", async () => {
            const { req, res, next } = createMocks();

            eventMembershipService.leaveEvent.mockResolvedValue();

            await eventMermbershipController.leaveEvent(req, res, next);

            expect(eventMembershipService.leaveEvent).toHaveBeenCalledWith({
                eventId: "1",
                userId: 10
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User successfully left the event"
            });
        });

        it("should forward leave errors to next", async () => {
            const { req, res, next } = createMocks();
            const error = new Error("Leave failed");

            eventMembershipService.leaveEvent.mockRejectedValue(error);

            await eventMermbershipController.leaveEvent(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* ==================================================
        MEMBERS / ORGANIZER / CO-ORGANIZERS
    ================================================== */

    describe("getEventMembers", () => {
        it("should get event members", async () => {
            const { req, res, next } = createMocks();
            const members = [{ id: 1, role: "participant" }];

            eventMembershipService.getEventMembers.mockResolvedValue(members);

            await eventMermbershipController.getEventMembers(req, res, next);

            expect(eventMembershipService.getEventMembers).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "All event Members retrieved successfully",
                members
            });
        });

        it("should forward get members errors to next", async () => {
            const { req, res, next } = createMocks();
            const error = new Error("Members failed");

            eventMembershipService.getEventMembers.mockRejectedValue(error);

            await eventMermbershipController.getEventMembers(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getEventStaff", () => {
        it("should get event staff with organizer and co_organizer roles", async () => {
            const { req, res, next } = createMocks();

            const eventStaff = [
                { id: 1, role: "organizer" },
                { id: 2, role: "co_organizer" }
            ];

            eventMembershipService.getEventStaff.mockResolvedValue(eventStaff);

            await eventMermbershipController.getEventStaff(req, res, next);

            expect(eventMembershipService.getEventStaff).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Event Staff retrieved successfully",
                eventStaff
            });
        });

        it("should forward get event staff errors to next", async () => {
            const { req, res, next } = createMocks();
            const error = new Error("Event staff failed");

            eventMembershipService.getEventStaff.mockRejectedValue(error);

            await eventMermbershipController.getEventStaff(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       ROLE MANAGEMENT
    ============================= */

    describe("updateEventMemberRole", () => {
        it("should update event member role", async () => {
            const { req, res, next } = createMocks({
                params: { eventId: "1", userId: "2" },
                body: { newRole: "co_organizer" }
            });

            const membership = { eventId: "1", userId: "2", role: "co_organizer" };

            eventMembershipService.updateEventMemberRole.mockResolvedValue(membership);

            await eventMermbershipController.updateEventMemberRole(req, res, next);

            expect(eventMembershipService.updateEventMemberRole).toHaveBeenCalledWith({
                eventId: "1",
                userId: "2",
                newRole: "co_organizer"
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Event User role updated successfully",
                membership
            });
        });

        it("should forward update role errors to next", async () => {
            const { req, res, next } = createMocks();
            const error = new Error("Update role failed");

            eventMembershipService.updateEventMemberRole.mockRejectedValue(error);

            await eventMermbershipController.updateEventMemberRole(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("removeEventMember", () => {
        it("should remove event member", async () => {
            const { req, res, next } = createMocks({
                params: { eventId: "1", userId: "2" }
            });

            eventMembershipService.removeEventMember.mockResolvedValue();

            await eventMermbershipController.removeEventMember(req, res, next);

            expect(eventMembershipService.removeEventMember).toHaveBeenCalledWith({
                eventId: "1",
                userId: "2"
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Event member removed successfully"
            });
        });

        it("should forward remove member errors to next", async () => {
            const { req, res, next } = createMocks();
            const error = new Error("Remove failed");

            eventMembershipService.removeEventMember.mockRejectedValue(error);

            await eventMermbershipController.removeEventMember(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
