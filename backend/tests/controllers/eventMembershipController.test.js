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

const controller = require("../../src/controllers/eventMembershipController");
const eventMembershipService = require("../../src/services/eventMembershipService");

jest.mock("../../src/services/eventMembershipService");

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

            await controller.joinEvent(req, res, next);

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

            await controller.joinEvent(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("leaveEvent", () => {
        it("should leave an event", async () => {
            const { req, res, next } = createMocks();

            eventMembershipService.leaveEvent.mockResolvedValue();

            await controller.leaveEvent(req, res, next);

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

            await controller.leaveEvent(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       CURRENT USER EVENTS
    ============================= */

    describe("getMyEvents", () => {
        it("should get current user events", async () => {
            const { req, res, next } = createMocks({
                query: { view: "joined", page: "1" },
                user: { userId: 10 }
            });

            const result = {
                page: 1,
                pageSize: 4,
                totalEvents: 1,
                totalPages: 1,
                events: [{ id: 1, title: "Event" }]
            };

            eventMembershipService.listMyEvents.mockResolvedValue(result);

            await controller.getMyEvents(req, res, next);

            expect(eventMembershipService.listMyEvents).toHaveBeenCalledWith(10, {
                view: "joined",
                page: "1"
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Events retrieved successfully",
                ...result
            });
        });

        it("should forward get my events errors to next", async () => {
            const { req, res, next } = createMocks();
            const error = new Error("My events failed");

            eventMembershipService.listMyEvents.mockRejectedValue(error);

            await controller.getMyEvents(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* ==================================================
        MEMBERS / ORGANIZER / CO-ORGANIZERS
    ================================================== */

    describe("getMembers", () => {
        it("should get event members", async () => {
            const { req, res, next } = createMocks();
            const members = [{ id: 1, role: "participant" }];

            eventMembershipService.listMembers.mockResolvedValue(members);

            await controller.getMembers(req, res, next);

            expect(eventMembershipService.listMembers).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Members retrieved successfully",
                members
            });
        });

        it("should forward get members errors to next", async () => {
            const { req, res, next } = createMocks();
            const error = new Error("Members failed");

            eventMembershipService.listMembers.mockRejectedValue(error);

            await controller.getMembers(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getOrganizers", () => {
        it("should get event organizers", async () => {
            const { req, res, next } = createMocks();
            const organizers = [{ id: 1, role: "organizer" }];

            eventMembershipService.listOrganizers.mockResolvedValue(organizers);

            await controller.getOrganizers(req, res, next);

            expect(eventMembershipService.listOrganizers).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Organizers retrieved successfully",
                organizers
            });
        });

        it("should forward get organizers errors to next", async () => {
            const { req, res, next } = createMocks();
            const error = new Error("Organizers failed");

            eventMembershipService.listOrganizers.mockRejectedValue(error);

            await controller.getOrganizers(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       ROLE MANAGEMENT
    ============================= */

    describe("updateMemberRole", () => {
        it("should update member role", async () => {
            const { req, res, next } = createMocks({
                params: { eventId: "1", userId: "2" },
                body: { newRole: "co_organizer" }
            });

            const membership = { eventId: "1", userId: "2", role: "co_organizer" };

            eventMembershipService.updateMemberRole.mockResolvedValue(membership);

            await controller.updateMemberRole(req, res, next);

            expect(eventMembershipService.updateMemberRole).toHaveBeenCalledWith({
                eventId: "1",
                userId: "2",
                newRole: "co_organizer"
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "User role updated successfully",
                membership
            });
        });

        it("should forward update role errors to next", async () => {
            const { req, res, next } = createMocks();
            const error = new Error("Update role failed");

            eventMembershipService.updateMemberRole.mockRejectedValue(error);

            await controller.updateMemberRole(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("removeMember", () => {
        it("should remove member", async () => {
            const { req, res, next } = createMocks({
                params: { eventId: "1", userId: "2" }
            });

            eventMembershipService.removeMember.mockResolvedValue();

            await controller.removeMember(req, res, next);

            expect(eventMembershipService.removeMember).toHaveBeenCalledWith({
                eventId: "1",
                userId: "2"
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Member removed successfully"
            });
        });

        it("should forward remove member errors to next", async () => {
            const { req, res, next } = createMocks();
            const error = new Error("Remove failed");

            eventMembershipService.removeMember.mockRejectedValue(error);

            await controller.removeMember(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
