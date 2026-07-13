const eventLikeService = require("../../../src/services/eventLikeService");

const eventLikeController = require("../../../src/controllers/eventLikeController");

const {
    createEventControllerMocks,
    expectNoResponseSent,
    expectJsonResponse
} = require("../../helpers/express/expressTestHelper");

/* ==========================================================================
   Event Like Controller Unit Tests

   Tests event like request handling and responses.

   Responsibilities
   - Test event like creation
   - Test event like removal
   - Test authenticated user forwarding
   - Test event identifier forwarding
   - Test service result responses
   - Test service error forwarding

   Notes
   - Event like services are mocked.
   - Business logic is tested separately in eventLikeService tests.
=========================================================================== */

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../../src/services/eventLikeService");

describe("event like controller", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       EVENT LIKE ACTIONS
    ============================= */

    describe.each([{
        name: "likeEvent",
        controller: eventLikeController.likeEvent,
        service: eventLikeService.likeEvent,
        statusCode: 201,
        message: "Event liked successfully",
        result: {
            eventId: 42,
            userId: 10,
            liked: true,
            likesCount: 5
        }
    }, {
        name: "unlikeEvent",
        controller: eventLikeController.unlikeEvent,
        service: eventLikeService.unlikeEvent,
        statusCode: 200,
        message: "Event unliked successfully",
        result: {
            eventId: 42,
            userId: 10,
            liked: false,
            likesCount: 4
        }
    }])("$name", ({
        controller,
        service,
        statusCode,
        message,
        result
    }) => {
        it("forwards the event and authenticated user to the service", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42"
                },
                user: {
                    userId: 10
                }
            });

            service.mockResolvedValue(result);

            await controller(req, res, next);

            expect(service).toHaveBeenCalledTimes(1);
            expect(service).toHaveBeenCalledWith({
                eventId: "42",
                userId: 10
            });

            expectJsonResponse(res, statusCode, {
                success: true,
                message,
                ...result
            });

            expect(next).not.toHaveBeenCalled();
        });

        it("forwards service errors to next", async () => {
            const { req, res, next } = createEventControllerMocks({
                params: {
                    eventId: "42"
                },
                user: {
                    userId: 10
                }
            });

            const error = new Error("Event like action failed");

            service.mockRejectedValue(error);

            await controller(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith(error);

            expectNoResponseSent(res);
        });
    });
});
