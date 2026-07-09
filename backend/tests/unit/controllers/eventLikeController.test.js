/* ==================================================
   EVENT LIKE CONTROLLER TESTS

   Tests:
   - liking an event
   - unliking an event

   Ensures:
   - controller calls service correctly
   - HTTP responses are properly formatted
   - errors are forwarded to next()
================================================== */

jest.mock("../../../src/services/eventLikeService");

const eventLikeController = require("../../../src/controllers/eventLikeController");
const eventLikeService = require("../../../src/services/eventLikeService");

const { createEventControllerMocks } = require("../../helpers/express/expressTestHelper");

describe("eventLikeController", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       LIKE EVENT
    ============================= */

    describe("likeEvent", () => {

        it("should like an event", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42"
                },
                user: {
                    userId: 10
                }
            });

            const result = {
                eventId: 42,
                userId: 10,
                liked: true,
                likesCount: 5
            };

            eventLikeService.likeEvent.mockResolvedValue(result);

            await eventLikeController.likeEvent(req, res, next);

            expect(eventLikeService.likeEvent).toHaveBeenCalledWith({
                eventId: "42",
                userId: 10
            });

            expect(res.status).toHaveBeenCalledWith(201);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event liked successfully",
                ...result
            });
        });

        it("should forward like event errors to next", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42"
                },
                user: {
                    userId: 10
                }
            });

            const error = new Error("Like failed");

            eventLikeService.likeEvent.mockRejectedValue(error);

            await eventLikeController.likeEvent(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       UNLIKE EVENT
    ============================= */

    describe("unlikeEvent", () => {

        it("should unlike an event", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42"
                },
                user: {
                    userId: 10
                }
            });

            const result = {
                eventId: 42,
                userId: 10,
                liked: false,
                likesCount: 4
            };

            eventLikeService.unlikeEvent.mockResolvedValue(result);

            await eventLikeController.unlikeEvent(req, res, next);

            expect(eventLikeService.unlikeEvent).toHaveBeenCalledWith({
                eventId: "42",
                userId: 10
            });

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Event unliked successfully",
                ...result
            });
        });

        it("should forward unlike event errors to next", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42"
                },
                user: {
                    userId: 10
                }
            });

            const error = new Error("Unlike failed");

            eventLikeService.unlikeEvent.mockRejectedValue(error);

            await eventLikeController.unlikeEvent(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
