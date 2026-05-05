/* ==================================================
   USER CONTROLLER TESTS

   Tests:
   - public user profile retrieval
   - public user events retrieval

   Ensures:
   - controller calls service correctly
   - responses are properly formatted
   - errors are forwarded to next()
================================================== */

const userController = require("../../src/controllers/userController");
const userService = require("../../src/services/userService");

jest.mock("../../src/services/userService");

// Create mocked Express request/response objects
const createMocks = ({ params = { id: 1 } } = {}) => {
    const req = { params };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };

    const next = jest.fn();

    return { req, res, next };
};

describe("userController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       PUBLIC PROFILE
    ============================= */

    describe("getPublicUserProfile", () => {
        it("should return public user profile", async () => {
            const { req, res, next } = createMocks();

            const mockProfile = {
                user: {
                    name: "John Doe",
                    avatar: null
                },
                stats: {
                    createdEventsCount: 2,
                    joinedEventsCount: 3
                }
            };

            userService.getPublicUserProfileById.mockResolvedValue(mockProfile);

            await userController.getPublicUserProfile(req, res, next);

            expect(userService.getPublicUserProfileById).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockProfile);
        });

        it("should forward public profile errors to next", async () => {
            const { req, res, next } = createMocks();

            const error = new Error("Public profile failed");
            userService.getPublicUserProfileById.mockRejectedValue(error);

            await userController.getPublicUserProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    /* =============================
       PUBLIC USER EVENTS
    ============================= */

    describe("getPublicUserEvents", () => {
        it("should return public user events", async () => {
            const { req, res, next } = createMocks();

            const mockEvents = {
                createdEvents: [],
                joinedEvents: []
            };

            userService.getPublicUserEventsById.mockResolvedValue(mockEvents);

            await userController.getPublicUserEvents(req, res, next);

            expect(userService.getPublicUserEventsById).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockEvents);
        });

        it("should forward public events errors to next", async () => {
            const { req, res, next } = createMocks();

            const error = new Error("Public events failed");
            userService.getPublicUserEventsById.mockRejectedValue(error);

            await userController.getPublicUserEvents(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
