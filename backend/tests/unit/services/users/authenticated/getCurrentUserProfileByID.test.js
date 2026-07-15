const mockFindUserByIdOrFail = jest.fn();

jest.mock("../../../../../src/models/userModel", () => ({
    name: "User"
}));

jest.mock("../../../../../src/utils/users/userQueries", () => ({
    findUserByIdOrFail:
        mockFindUserByIdOrFail
}));

jest.mock("../../../../../src/config/database", () => ({
    transaction: jest.fn()
}));

jest.mock("../../../../../src/models/eventModel", () => ({
    name: "Event"
}));

jest.mock("../../../../../src/models/associations/eventUserRoleModel", () => ({
    name: "EventUserRole"
}));

jest.mock("../../../../../src/models/associations/eventLikeModel", () => ({
    name: "EventLike"
}));

jest.mock("../../../../../src/utils/events/eventStatus", () => ({
    getEventStatus: jest.fn()
}));

jest.mock("../../../../../src/utils/events/eventFilters", () => ({
    buildEventWhereConditions: jest.fn()
}));

jest.mock("../../../../../src/utils/events/eventCreatorInclude", () => ({
    buildEventCreatorInclude: jest.fn()
}));

jest.mock("../../../../../src/utils/events/eventListStats", () => ({
    getEventListStats: jest.fn()
}));

jest.mock("../../../../../src/utils/stringNormalizer", () => ({
    normalizeEmail: jest.fn()
}));

jest.mock("../../../../../src/utils/files/uploadedFileStorage", () => ({
    deleteUploadedFile: jest.fn()
}));

jest.mock("../../../../../src/utils/auth/passwordHasher", () => ({
    hashPassword: jest.fn(),
    comparePassword: jest.fn()
}));

jest.mock("../../../../../src/utils/pagination", () => ({
    getPaginationOptions: jest.fn(),
    getTotalCount: jest.fn(),
    getTotalPages: jest.fn()
}));

const User = require("../../../../../src/models/userModel");

const { getCurrentUserProfileById } = require("../../../../../src/services/users/authenticatedUserService");

const { createMockUser } = require("../../../../factories/userFactory");

/* ==========================================================================
   Get Current User Profile Service Unit Tests

   Tests current user profile retrieval.

   Responsibilities
   - Test current user lookup delegation
   - Test profile result forwarding
   - Test missing user error propagation
   - Test unexpected error propagation

   Notes
   - User lookup behavior is delegated to findUserByIdOrFail.
=========================================================================== */

describe("get current user profile service", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       PROFILE RETRIEVAL
    ============================= */

    describe("getCurrentUserProfileById", () => {
        it("returns the current user profile", async () => {
            const user = createMockUser({
                id: 10,
                name: "John Doe",
                email: "john@test.com",
                avatar: null
            });

            mockFindUserByIdOrFail.mockResolvedValue(user);

            const result = await getCurrentUserProfileById(10);

            expect(mockFindUserByIdOrFail).toHaveBeenCalledTimes(1);
            expect(mockFindUserByIdOrFail).toHaveBeenCalledWith(User, 10);

            expect(result).toBe(user);
        });
    });

    /* =============================
       USER VALIDATION
    ============================= */

    describe("User validation", () => {
        it("propagates the missing user error", async () => {
            const error = Object.assign(
                new Error("User not found"),
                {
                    statusCode: 404
                }
            );

            mockFindUserByIdOrFail.mockRejectedValue(error);

            await expect(getCurrentUserProfileById(999)).rejects.toBe(error);
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it("propagates user lookup errors", async () => {
            const error = new Error("User lookup failed");

            mockFindUserByIdOrFail.mockRejectedValue(error);

            await expect(getCurrentUserProfileById(10)).rejects.toBe(error);
        });
    });
});
