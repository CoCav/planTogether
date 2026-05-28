/* ==================================================
   EVENT CONTROLLER TESTS

   Tests:
   - event creation
   - event listing
   - current user event access retrieval
   - single event retrieval
   - event update
   - event image preservation, replacement and removal
   - event deletion

   Ensures:
   - controller calls service correctly
   - uploaded event images are preserved, replaced and cleared correctly
   - event access responses are properly formatted
   - HTTP responses are properly formatted
   - errors are forwarded to next()
================================================== */

jest.mock("../../../src/services/eventService");

const eventController = require("../../../src/controllers/eventController");
const eventService = require("../../../src/services/eventService");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");
const { EVENT_STATUS } = require("../../../src/constants/eventStatus");

const { createEventControllerMocks } = require("../../helpers/express/mockExpress");

const { createEventResponse } = require("../../factories/eventFactory");

describe("eventController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       CREATE EVENT
    ============================= */

    describe("createEvent", () => {
        it("should create an event without image", async () => {
            const { req, res, next } = createEventControllerMocks({
                body: { title: "Test Event" },
                user: { userId: 10 }
            });

            const event = createEventResponse({
                image: null
            });

            eventService.createEvent.mockResolvedValue(event);

            await eventController.createEvent(req, res, next);

            expect(eventService.createEvent).toHaveBeenCalledWith({
                title: "Test Event",
                image: null
            }, 10);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event created successfully",
                event
            });
        });

        it("should create an event with image", async () => {
            const { req, res, next } = createEventControllerMocks({
                body: { title: "Test Event" },
                user: { userId: 10 },
                file: { filename: "event-123.png" }
            });

            const event = createEventResponse({
                image: "/uploads/events/event-123.png"
            });

            eventService.createEvent.mockResolvedValue(event);

            await eventController.createEvent(req, res, next);

            expect(eventService.createEvent).toHaveBeenCalledWith({
                title: "Test Event",
                image: "/uploads/events/event-123.png"
            }, 10);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event created successfully",
                event
            });
        });

        it("should forward create event errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Create failed");
            eventService.createEvent.mockRejectedValue(error);

            await eventController.createEvent(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       READ EVENTS
    ============================= */

    /* =============================
       GET ALL EVENTS
    ============================= */

    describe("getAllEvents", () => {
        it("should get all events", async () => {
            const { req, res, next } = createEventControllerMocks({
                query: { page: "1" }
            });

            const result = {
                page: 1,
                pageSize: 4,
                totalEvents: 1,
                totalPages: 1,
                events: [createEventResponse()]
            };

            eventService.getAllEvents.mockResolvedValue(result);

            await eventController.getAllEvents(req, res, next);

            expect(eventService.getAllEvents).toHaveBeenCalledWith({ page: "1" });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Events retrieved successfully",
                ...result
            });
        });

        it("should forward get all events errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Fetch failed");
            eventService.getAllEvents.mockRejectedValue(error);

            await eventController.getAllEvents(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       CURRENT USER EVENT ACCESS
    ============================= */

    describe("getCurrentUserEventAccess", () => {
        it("should get current user event access", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: { eventId: "42" },
                user: { userId: 10 }
            });

            const access = {
                role: EVENT_ROLES.ORGANIZER,
                status: EVENT_STATUS.UPCOMING,
                canEdit: true,
                canDelete: true
            };

            eventService.getCurrentUserEventAccess.mockResolvedValue(access);

            await eventController.getCurrentUserEventAccess(req, res, next);

            expect(eventService.getCurrentUserEventAccess).toHaveBeenCalledWith(
                "42",
                10
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Current user event access retrieved successfully",
                ...access
            });
        });

        it("should forward current user event access errors to next", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: { eventId: "42" },
                user: { userId: 10 }
            });

            const error = new Error("Access failed");

            eventService.getCurrentUserEventAccess.mockRejectedValue(error);

            await eventController.getCurrentUserEventAccess(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       GET EVENT
    ============================= */

    describe("getEvent", () => {
        it("should get an event by ID", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: { eventId: "42" }
            });

            const event = createEventResponse({
                id: 42,
                title: "Event"
            });

            eventService.getEventByID.mockResolvedValue(event);

            await eventController.getEvent(req, res, next);

            expect(eventService.getEventByID).toHaveBeenCalledWith("42");

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event retrieved successfully",
                event
            });
        });

        it("should forward get event errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Not found");
            eventService.getEventByID.mockRejectedValue(error);

            await eventController.getEvent(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       UPDATE EVENT
    ============================= */

    describe("updateEvent", () => {
        it("should update an event without new image", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: { eventId: "42" },
                body: { title: "Updated Event" }
            });

            const event = createEventResponse({
                id: 42,
                title: "Updated Event"
            });

            eventService.updateEventByID.mockResolvedValue(event);

            await eventController.updateEvent(req, res, next);

            expect(eventService.updateEventByID).toHaveBeenCalledWith("42", {
                title: "Updated Event",
                image: undefined
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event updated successfully",
                event
            });
        });

        it("should clear event image when empty image field is provided", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: { eventId: "42" },
                body: {
                    title: "Updated Event",
                    image: ""
                }
            });

            const event = createEventResponse({
                id: 42,
                title: "Updated Event",
                image: null
            });

            eventService.updateEventByID.mockResolvedValue(event);

            await eventController.updateEvent(req, res, next);

            expect(eventService.updateEventByID).toHaveBeenCalledWith("42", {
                title: "Updated Event",
                image: null
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event updated successfully",
                event
            });
        });

        it("should update an event with new image", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: { eventId: "42" },
                body: { title: "Updated Event" },
                file: { filename: "event-updated.png" }
            });

            const event = createEventResponse({
                id: 42,
                title: "Updated Event",
                image: "/uploads/events/event-updated.png"
            });

            eventService.updateEventByID.mockResolvedValue(event);

            await eventController.updateEvent(req, res, next);

            expect(eventService.updateEventByID).toHaveBeenCalledWith("42", {
                title: "Updated Event",
                image: "/uploads/events/event-updated.png"
            });

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event updated successfully",
                event
            });
        });

        it("should forward update event errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Update failed");
            eventService.updateEventByID.mockRejectedValue(error);

            await eventController.updateEvent(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       DELETE EVENT
    ============================= */

    describe("deleteEvent", () => {
        it("should delete an event", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: { eventId: "42" }
            });

            eventService.deleteEventByID.mockResolvedValue();

            await eventController.deleteEvent(req, res, next);

            expect(eventService.deleteEventByID).toHaveBeenCalledWith("42");

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event deleted successfully"
            });
        });

        it("should forward delete event errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Delete failed");
            eventService.deleteEventByID.mockRejectedValue(error);

            await eventController.deleteEvent(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
