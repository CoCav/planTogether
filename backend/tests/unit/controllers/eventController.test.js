const eventService = require("../../../src/services/eventService");

const { EVENT_ROLES } = require("../../../src/constants/eventRoles");
const { EVENT_STATUS } = require("../../../src/constants/eventStatus");

const eventController = require("../../../src/controllers/eventController");

const {
    createEventControllerMocks,
    expectNoResponseSent,
    expectJsonResponse
} = require("../../helpers/express/expressTestHelper");

const { createEventResponse } = require("../../factories/eventFactory");

/* ==========================================================================
   Event Controller Unit Tests

   Tests event request handling and responses.

   Responsibilities
   - Test event creation
   - Test event listing
   - Test current user event access retrieval
   - Test event detail retrieval
   - Test event updates
   - Test event image creation, preservation, removal and replacement
   - Test optional authenticated user forwarding
   - Test event deletion
   - Test service error forwarding

   Notes
   - Event services are mocked.
   - Business logic is tested separately in eventService tests.
=========================================================================== */

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../src/services/eventService");

describe("event controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       CREATE EVENT
    ============================= */

    describe("createEvent", () => {
        it.each([[
            "without an uploaded image",
            undefined,
            null
        ], [
            "with an uploaded image",
            {
                filename: "event-123.png"
            },
            "/uploads/events/event-123.png"
        ]])("creates an event %s",
            async (_, file, expectedImage) => {
                const { req, res, next } = createEventControllerMocks({
                    body: {
                        title: "Test Event"
                    },
                    user: {
                        userId: 10
                    },
                    file
                });

                const event = createEventResponse({
                    image: expectedImage
                });

                eventService.createEvent.mockResolvedValue(event);

                await eventController.createEvent(req, res, next);

                expect(eventService.createEvent).toHaveBeenCalledTimes(1);

                expect(eventService.createEvent).toHaveBeenCalledWith(
                    {
                        title: "Test Event",
                        image: expectedImage
                    },
                    10
                );

                expectJsonResponse(res, 201, {
                    success: true,
                    message: "Event created successfully",
                    event
                });

                expect(next).not.toHaveBeenCalled();
            }
        );

        it("forwards service errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Event creation failed");

            eventService.createEvent.mockRejectedValue(error);

            await eventController.createEvent(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(error);

            expectNoResponseSent(res);
        });
    });

    /* =============================
       EVENT LISTING
    ============================= */

    describe("getAllEvents", () => {
        it.each([[
            "an authenticated request",
            {
                userId: 10
            },
            10
        ], [
            "an anonymous request",
            undefined,
            undefined
        ]])("retrieves events for %s",
            async (_, user, expectedUserId) => {
                const { req, res, next } = createEventControllerMocks({
                    query: {
                        page: "1",
                        pageSize: "10"
                    },
                    user
                });

                const result = {
                    page: 1,
                    pageSize: 10,
                    totalEvents: 1,
                    totalPages: 1,
                    events: [
                        createEventResponse()
                    ]
                };

                eventService.getAllEvents.mockResolvedValue(result);

                await eventController.getAllEvents(req, res, next);

                expect(eventService.getAllEvents).toHaveBeenCalledTimes(1);

                expect(eventService.getAllEvents).toHaveBeenCalledWith(
                    req.query,
                    expectedUserId
                );

                expectJsonResponse(res, 200, {
                    success: true,
                    message: "Events retrieved successfully",
                    ...result
                });

                expect(next).not.toHaveBeenCalled();
            }
        );

        it("forwards service errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Event retrieval failed");

            eventService.getAllEvents.mockRejectedValue(error);

            await eventController.getAllEvents(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(error);

            expectNoResponseSent(res);
        });
    });

    /* =============================
       CURRENT USER EVENT ACCESS
    ============================= */

    describe("getCurrentUserEventAccess", () => {
        it("retrieves the authenticated user's event access", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42"
                },
                user: {
                    userId: 10
                }
            });

            const access = {
                role: EVENT_ROLES.ORGANIZER,
                status: EVENT_STATUS.UPCOMING,
                canEdit: true,
                canDelete: true
            };

            eventService.getCurrentUserEventAccess.mockResolvedValue(access);

            await eventController.getCurrentUserEventAccess(req, res, next);

            expect(eventService.getCurrentUserEventAccess).toHaveBeenCalledTimes(1);

            expect(eventService.getCurrentUserEventAccess).toHaveBeenCalledWith(
                "42",
                10
            );

            expectJsonResponse(res, 200, {
                success: true,
                message: "Current user event access retrieved successfully",
                ...access
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("forwards service errors to next", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42"
                }
            });

            const error = new Error("Event access retrieval failed");

            eventService.getCurrentUserEventAccess.mockRejectedValue(error);

            await eventController.getCurrentUserEventAccess(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(error);

            expectNoResponseSent(res);
        });
    });

    /* =============================
       EVENT DETAILS
    ============================= */

    describe("getEvent", () => {
        it.each([[
            "an authenticated request",
            {
                userId: 10
            },
            10
        ], [
            "an anonymous request",
            undefined,
            undefined
        ]])("retrieves an event for %s",
            async (_, user, expectedUserId) => {
                const { req, res, next } = createEventControllerMocks({
                    params: {
                        eventId: "42"
                    },
                    user
                });

                const event = createEventResponse({
                    id: 42,
                    title: "Test Event"
                });

                eventService.getEventById.mockResolvedValue(event);

                await eventController.getEvent(req, res, next);

                expect(eventService.getEventById).toHaveBeenCalledTimes(1);

                expect(eventService.getEventById).toHaveBeenCalledWith(
                    "42",
                    expectedUserId
                );

                expectJsonResponse(res, 200, {
                    success: true,
                    message: "Event retrieved successfully",
                    event
                });

                expect(next).not.toHaveBeenCalled();
            }
        );

        it("forwards service errors to next", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42"
                }
            });

            const error = new Error("Event not found");

            eventService.getEventById.mockRejectedValue(error);

            await eventController.getEvent(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(error);

            expectNoResponseSent(res);
        });
    });

    /* =============================
       UPDATE EVENT
    ============================= */

    describe("updateEvent", () => {
        it.each([[
            "preserves the image when the image field is omitted",
            {
                title: "Updated Event"
            },
            undefined,
            undefined
        ], [
            "clears the image when an empty image field is provided",
            {
                title: "Updated Event",
                image: ""
            },
            undefined,
            null
        ], [
            "preserves an explicitly provided image path",
            {
                title: "Updated Event",
                image: "/uploads/events/existing.png"
            },
            undefined,
            "/uploads/events/existing.png"
        ], [
            "replaces the image when a new file is uploaded",
            {
                title: "Updated Event"
            },
            {
                filename: "event-updated.png"
            },
            "/uploads/events/event-updated.png"
        ]])("%s",
            async (
                _,
                body,
                file,
                expectedImage
            ) => {
                const { req, res, next } = createEventControllerMocks({
                    params: {
                        eventId: "42"
                    },
                    body,
                    file
                });

                const event = createEventResponse({
                    id: 42,
                    title: "Updated Event",
                    image: expectedImage
                });

                eventService.updateEventById.mockResolvedValue(event);

                await eventController.updateEvent(req, res, next);

                expect(eventService.updateEventById).toHaveBeenCalledTimes(1);

                expect(eventService.updateEventById).toHaveBeenCalledWith(
                    "42",
                    {
                        ...body,
                        image: expectedImage
                    }
                );

                expectJsonResponse(res, 200, {
                    success: true,
                    message: "Event updated successfully",
                    event
                });

                expect(next).not.toHaveBeenCalled();
            }
        );

        it("gives an uploaded file priority over the image body field", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42"
                },
                body: {
                    title: "Updated Event",
                    image: ""
                },
                file: {
                    filename: "replacement.png"
                }
            });

            const event = createEventResponse({
                id: 42,
                image: "/uploads/events/replacement.png"
            });

            eventService.updateEventById.mockResolvedValue(event);

            await eventController.updateEvent(req, res, next);

            expect(eventService.updateEventById).toHaveBeenCalledWith(
                "42",
                {
                    title: "Updated Event",
                    image:
                        "/uploads/events/replacement.png"
                }
            );

            expectJsonResponse(res, 200, {
                success: true,
                message: "Event updated successfully",
                event
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("forwards service errors to next", async () => {
            const { req, res, next } = createEventControllerMocks();

            const error = new Error("Event update failed");

            eventService.updateEventById.mockRejectedValue(error);

            await eventController.updateEvent(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(error);

            expectNoResponseSent(res);
        });
    });

    /* =============================
       DELETE EVENT
    ============================= */

    describe("deleteEvent", () => {
        it("deletes an event", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42"
                }
            });

            eventService.deleteEventById.mockResolvedValue();

            await eventController.deleteEvent(req, res, next);

            expect(eventService.deleteEventById).toHaveBeenCalledTimes(1);

            expect(eventService.deleteEventById).toHaveBeenCalledWith("42");

            expectJsonResponse(res, 200, {
                success: true,
                message: "Event deleted successfully"
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("forwards service errors to next", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42"
                }
            });

            const error = new Error("Event deletion failed");

            eventService.deleteEventById.mockRejectedValue(error);

            await eventController.deleteEvent(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(error);

            expectNoResponseSent(res);
        });
    });
});
