const eventController = require("../../src/controllers/eventController");
const eventService = require("../../src/services/eventService");

jest.mock("../../src/services/eventService");

const createMocks = ({ body = {}, params = { eventId: "1" }, query = {}, user = { userId: 10 }, file = undefined } = {}) => {
    const req = { body, params, query, user, file };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    return { req, res, next };
};

describe("eventController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create an event without image", async () => {
        const { req, res, next } = createMocks({
            body: { title: "Test Event" },
            user: { userId: 10 }
        });

        eventService.createEvent.mockResolvedValue({
            id: 1,
            title: "Test Event",
            image: null
        });

        await eventController.createEvent(req, res, next);

        expect(eventService.createEvent).toHaveBeenCalledWith({
            title: "Test Event",
            image: null
        }, 10);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "Event created successfully",
            event: { id: 1, title: "Test Event", image: null }
        });
    });

    it("should create an event with image", async () => {
        const { req, res, next } = createMocks({
            body: { title: "Test Event" },
            user: { userId: 10 },
            file: { filename: "event-123.png" }
        });

        eventService.createEvent.mockResolvedValue({
            id: 1,
            title: "Test Event",
            image: "/uploads/events/event-123.png"
        });

        await eventController.createEvent(req, res, next);

        expect(eventService.createEvent).toHaveBeenCalledWith({
            title: "Test Event",
            image: "/uploads/events/event-123.png"
        }, 10);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: "Event created successfully",
            event: {
                id: 1,
                title: "Test Event",
                image: "/uploads/events/event-123.png"
            }
        });
    });

    it("should forward create event errors to next", async () => {
        const { req, res, next } = createMocks();
        const error = new Error("Create failed");

        eventService.createEvent.mockRejectedValue(error);

        await eventController.createEvent(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    it("should get all events", async () => {
        const { req, res, next } = createMocks({
            query: { page: "1" }
        });

        const result = {
            page: 1,
            pageSize: 4,
            totalEvents: 1,
            totalPages: 1,
            events: [{ id: 1 }]
        };

        eventService.getAllEvents.mockResolvedValue(result);

        await eventController.getAllEvents(req, res, next);

        expect(eventService.getAllEvents).toHaveBeenCalledWith({ page: "1" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "All events retrieved successfully",
            ...result
        });
    });

    it("should forward get all events errors to next", async () => {
        const { req, res, next } = createMocks();
        const error = new Error("Fetch failed");

        eventService.getAllEvents.mockRejectedValue(error);

        await eventController.getAllEvents(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    it("should get an event by id", async () => {
        const { req, res, next } = createMocks({
            params: { eventId: "42" }
        });

        eventService.getEventById.mockResolvedValue({ id: 42, title: "Event" });

        await eventController.getEvent(req, res, next);

        expect(eventService.getEventById).toHaveBeenCalledWith("42");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Event retrieved successfully",
            event: { id: 42, title: "Event" }
        });
    });

    it("should forward get event errors to next", async () => {
        const { req, res, next } = createMocks();
        const error = new Error("Not found");

        eventService.getEventById.mockRejectedValue(error);

        await eventController.getEvent(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    it("should get filtered events", async () => {
        const { req, res, next } = createMocks({
            query: { theme: "tech" }
        });

        const result = {
            events: [{ id: 1, theme: "tech" }],
            totalEvents: 1
        };

        eventService.getFilteredEvents.mockResolvedValue(result);

        await eventController.getFilteredEvents(req, res, next);

        expect(eventService.getFilteredEvents).toHaveBeenCalledWith({ theme: "tech" });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(result);
    });

    it("should forward filtered events errors to next", async () => {
        const { req, res, next } = createMocks();
        const error = new Error("Filter failed");

        eventService.getFilteredEvents.mockRejectedValue(error);

        await eventController.getFilteredEvents(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    it("should update an event without new image", async () => {
        const { req, res, next } = createMocks({
            params: { eventId: "42" },
            body: { title: "Updated Event" }
        });

        eventService.updateEventById.mockResolvedValue({
            id: 42,
            title: "Updated Event"
        });

        await eventController.updateEvent(req, res, next);

        expect(eventService.updateEventById).toHaveBeenCalledWith("42", {
            title: "Updated Event",
            image: undefined
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Event updated successfully",
            event: { id: 42, title: "Updated Event" }
        });
    });

    it("should update an event with new image", async () => {
        const { req, res, next } = createMocks({
            params: { eventId: "42" },
            body: { title: "Updated Event" },
            file: { filename: "event-updated.png" }
        });

        eventService.updateEventById.mockResolvedValue({
            id: 42,
            title: "Updated Event",
            image: "/uploads/events/event-updated.png"
        });

        await eventController.updateEvent(req, res, next);

        expect(eventService.updateEventById).toHaveBeenCalledWith("42", {
            title: "Updated Event",
            image: "/uploads/events/event-updated.png"
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Event updated successfully",
            event: {
                id: 42,
                title: "Updated Event",
                image: "/uploads/events/event-updated.png"
            }
        });
    });

    it("should forward update event errors to next", async () => {
        const { req, res, next } = createMocks();
        const error = new Error("Update failed");

        eventService.updateEventById.mockRejectedValue(error);

        await eventController.updateEvent(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    it("should delete an event", async () => {
        const { req, res, next } = createMocks({
            params: { eventId: "42" }
        });

        eventService.deleteEventById.mockResolvedValue({ id: 42 });

        await eventController.deleteEvent(req, res, next);

        expect(eventService.deleteEventById).toHaveBeenCalledWith("42");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: "Event deleted successfully"
        });
    });

    it("should forward delete event errors to next", async () => {
        const { req, res, next } = createMocks();
        const error = new Error("Delete failed");

        eventService.deleteEventById.mockRejectedValue(error);

        await eventController.deleteEvent(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
