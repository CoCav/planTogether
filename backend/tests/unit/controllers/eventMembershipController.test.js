/* ==================================================
   EVENT MEMBERSHIP CONTROLLER TESTS

   Tests:
   - joining events
   - leaving events
   - retrieving event members
   - retrieving event staff
   - updating member roles
   - removing members

   Ensures:
   - controller calls service correctly
   - HTTP responses are properly formatted
   - route params and authenticated user payload are passed correctly
   - errors are forwarded to next()
================================================== */

const eventMembershipController = require("../../../src/controllers/eventMembershipController");

const eventMembershipService = require("../../../src/services/eventMembershipService");

const { createMockReqResNext } = require("../../helpers/mockExpress");

jest.mock("../../../src/services/eventMembershipService");

const createEventMembershipControllerMocks = ({
    body = {},
    params = { eventId: "1" },
    query = {},
    user = { userId: 10 },
    file = undefined
} = {}) => {
    return createMockReqResNext({ body, params, query, user, file });
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
            const { req, res, next } = createEventMembershipControllerMocks();

            const membership = {
                eventId: "1",
                userId: 10,
                role: "participant"
            };

            eventMembershipService.joinEvent.mockResolvedValue(membership);

            await eventMembershipController.joinEvent(req, res, next);

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
            const { req, res, next } = createEventMembershipControllerMocks();

            const error = new Error("Join failed");
            eventMembershipService.joinEvent.mockRejectedValue(error);

            await eventMembershipController.joinEvent(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("leaveEvent", () => {
        it("should leave an event", async () => {
            const { req, res, next } = createEventMembershipControllerMocks();

            eventMembershipService.leaveEvent.mockResolvedValue();

            await eventMembershipController.leaveEvent(req, res, next);

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
            const { req, res, next } = createEventMembershipControllerMocks();

            const error = new Error("Leave failed");
            eventMembershipService.leaveEvent.mockRejectedValue(error);

            await eventMembershipController.leaveEvent(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* ==================================================
       MEMBERS / ORGANIZER / CO-ORGANIZERS
    ================================================== */

    describe("getEventMembers", () => {
        it("should get event members", async () => {
            const { req, res, next } = createEventMembershipControllerMocks();

            const members = [
                { id: 1, role: "participant" }
            ];

            eventMembershipService.getEventMembers.mockResolvedValue(members);

            await eventMembershipController.getEventMembers(req, res, next);

            expect(eventMembershipService.getEventMembers).toHaveBeenCalledWith("1");

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                message: "Event members retrieved successfully",
                members
            });
        });

        it("should forward get members errors to next", async () => {
            const { req, res, next } = createEventMembershipControllerMocks();

            const error = new Error("Members failed");
            eventMembershipService.getEventMembers.mockRejectedValue(error);

            await eventMembershipController.getEventMembers(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getEventStaff", () => {
        it("should get event staff with organizer and co_organizer roles", async () => {
            const { req, res, next } = createEventMembershipControllerMocks();

            const eventStaff = [
                { id: 1, role: "organizer" },
                { id: 2, role: "co_organizer" }
            ];

            eventMembershipService.getEventStaff.mockResolvedValue(eventStaff);

            await eventMembershipController.getEventStaff(req, res, next);

            expect(eventMembershipService.getEventStaff).toHaveBeenCalledWith("1");

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                message: "Event Staff retrieved successfully",
                eventStaff
            });
        });

        it("should forward get event staff errors to next", async () => {
            const { req, res, next } = createEventMembershipControllerMocks();

            const error = new Error("Event staff failed");
            eventMembershipService.getEventStaff.mockRejectedValue(error);

            await eventMembershipController.getEventStaff(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       ROLE MANAGEMENT
    ============================= */

    describe("updateEventMemberRole", () => {
        it("should update event member role", async () => {
            const { req, res, next } =
                createEventMembershipControllerMocks({
                    params: {
                        eventId: "1",
                        userId: "2"
                    },
                    body: {
                        newRole: "co_organizer"
                    }
                });

            const membership = {
                eventId: "1",
                userId: "2",
                role: "co_organizer"
            };

            eventMembershipService.updateEventMemberRole.mockResolvedValue(membership);

            await eventMembershipController.updateEventMemberRole(req, res, next);

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
            const { req, res, next } =
                createEventMembershipControllerMocks();

            const error = new Error("Update role failed");
            eventMembershipService.updateEventMemberRole.mockRejectedValue(error);

            await eventMembershipController.updateEventMemberRole(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("removeEventMember", () => {
        it("should remove event member", async () => {
            const { req, res, next } =
                createEventMembershipControllerMocks({
                    params: {
                        eventId: "1",
                        userId: "2"
                    }
                });

            eventMembershipService.removeEventMember.mockResolvedValue();

            await eventMembershipController.removeEventMember(req, res, next);

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
            const { req, res, next } = createEventMembershipControllerMocks();

            const error = new Error("Remove failed");
            eventMembershipService.removeEventMember.mockRejectedValue(error);

            await eventMembershipController.removeEventMember(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
