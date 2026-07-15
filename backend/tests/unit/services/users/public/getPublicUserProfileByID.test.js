const mockFindUserByIdOrFail = jest.fn();
const mockFormatPublicUser = jest.fn();

const mockOpNe = Symbol("ne");

jest.mock("sequelize", () => ({
    Op: {
        ne: mockOpNe
    }
}));

jest.mock("../../../../../src/models/userModel", () => ({
    name: "User"
}));

jest.mock("../../../../../src/models/eventModel", () => ({
    count: jest.fn()
}));

jest.mock("../../../../../src/models/associations/eventUserRoleModel", () => ({
    count: jest.fn()
}));

jest.mock("../../../../../src/models/associations/eventLikeModel", () => ({
    name: "EventLike"
}));

jest.mock("../../../../../src/utils/users/userQueries", () => ({
    findUserByIdOrFail: mockFindUserByIdOrFail
}));

jest.mock("../../../../../src/utils/users/public/publicUserFormatter", () => ({
    formatPublicUser: mockFormatPublicUser
}));

jest.mock("../../../../../src/utils/events/eventFilters", () => ({
    buildEventWhereConditions: jest.fn()
}));

jest.mock("../../../../../src/utils/events/eventCreatorInclude", () => ({
    buildEventCreatorInclude: jest.fn()
}));

jest.mock("../../../../../src/utils/events/eventStatus", () => ({
    getEventStatus: jest.fn()
}));

jest.mock("../../../../../src/utils/events/eventListStats", () => ({
    getEventListStats: jest.fn()
}));

jest.mock("../../../../../src/utils/users/public/publicUserEventQueries", () => ({
    getPublicCreatedEvents: jest.fn(),
    getPublicJoinedEvents: jest.fn()
}));

jest.mock("../../../../../src/utils/pagination", () => ({
    getPaginationOptions: jest.fn(),
    getTotalCount: jest.fn(),
    getTotalPages: jest.fn()
}));

jest.mock("../../../../../src/config/database", () => ({
    name: "sequelize"
}));

const User = require("../../../../../src/models/userModel");
const Event = require("../../../../../src/models/eventModel");
const EventUserRole = require("../../../../../src/models/associations/eventUserRoleModel");

const { EVENT_ROLES } = require("../../../../../src/constants/eventRoles");
const { PUBLIC_USER_PROFILE_ATTRIBUTES } = require("../../../../../src/constants/userAttributes");

const { getPublicUserProfileById } = require("../../../../../src/services/users/publicUserService");

const { createMockUser } = require("../../../../factories/userFactory");

/* ==========================================================================
   Get Public User Profile Service Unit Tests

   Tests public user profile retrieval.

   Responsibilities
   - Test public user lookup
   - Test public attribute selection
   - Test public user formatting
   - Test created event statistics
   - Test joined event statistics
   - Test organizer membership exclusion
   - Test missing user error propagation
   - Test unexpected error propagation

   Notes
   - User lookup and formatter utilities are mocked.
   - Created and joined event counts are retrieved in parallel.
=========================================================================== */

describe("get public user profile service", () => {
    let user;
    let formattedUser;

    beforeEach(() => {
        jest.clearAllMocks();

        user = createMockUser({
            id: 10,
            name: "John Doe",
            email: "private@test.com",
            avatar: "/uploads/avatars/john.png"
        });

        formattedUser = {
            name: "John Doe",
            avatar: "/uploads/avatars/john.png"
        };

        mockFindUserByIdOrFail.mockResolvedValue(user);

        mockFormatPublicUser.mockReturnValue(formattedUser);

        Event.count.mockResolvedValue(3);

        EventUserRole.count.mockResolvedValue(5);
    });

    /* =============================
       PUBLIC PROFILE
    ============================= */

    describe("getPublicUserProfileById", () => {
        it("returns the formatted public profile with event statistics", async () => {
            const result = await getPublicUserProfileById(10);

            expect(mockFindUserByIdOrFail).toHaveBeenCalledTimes(1);

            expect(mockFindUserByIdOrFail).toHaveBeenCalledWith(User, 10, {
                attributes: PUBLIC_USER_PROFILE_ATTRIBUTES
            });

            expect(mockFormatPublicUser).toHaveBeenCalledTimes(1);

            expect(mockFormatPublicUser).toHaveBeenCalledWith(user);

            expect(Event.count).toHaveBeenCalledTimes(1);

            expect(Event.count).toHaveBeenCalledWith({
                where: {
                    creatorId: 10
                }
            });

            expect(EventUserRole.count).toHaveBeenCalledTimes(1);

            expect(EventUserRole.count).toHaveBeenCalledWith({
                where: {
                    userId: 10,
                    deletedAt: null,
                    role: {
                        [mockOpNe]: EVENT_ROLES.ORGANIZER
                    }
                }
            });

            expect(result).toEqual({
                user: formattedUser,
                stats: {
                    createdEventsCount: 3,
                    joinedEventsCount: 5
                }
            });
        });

        it("supports a public profile with no avatar", async () => {
            user.avatar = null;

            formattedUser = {
                name: "John Doe",
                avatar: null
            };

            mockFormatPublicUser.mockReturnValue(formattedUser);

            Event.count.mockResolvedValue(0);

            EventUserRole.count.mockResolvedValue(0);

            const result = await getPublicUserProfileById(10);

            expect(mockFormatPublicUser).toHaveBeenCalledWith(user);

            expect(result).toEqual({
                user: {
                    name: "John Doe",
                    avatar: null
                },
                stats: {
                    createdEventsCount: 0,
                    joinedEventsCount: 0
                }
            });
        });
    });

    /* =============================
       PROFILE STATISTICS
    ============================= */

    describe("Profile statistics", () => {
        it("counts events created by the public user", async () => {
            await getPublicUserProfileById(10);

            expect(Event.count).toHaveBeenCalledWith({
                where: {
                    creatorId: 10
                }
            });
        });

        it("counts only active non-organizer memberships as joined events", async () => {
            await getPublicUserProfileById(10);

            expect(EventUserRole.count).toHaveBeenCalledWith({
                where: {
                    userId: 10,
                    deletedAt: null,
                    role: {
                        [mockOpNe]: EVENT_ROLES.ORGANIZER
                    }
                }
            });
        });

        it("selects only public profile attributes", async () => {
            await getPublicUserProfileById(10);

            expect(mockFindUserByIdOrFail).toHaveBeenCalledWith(User, 10, {
                attributes: PUBLIC_USER_PROFILE_ATTRIBUTES
            });
        });
    });

    /* =============================
       USER VALIDATION
    ============================= */

    describe("User validation", () => {
        it("propagates the missing user error before calculating statistics", async () => {
            const error = Object.assign(
                new Error("User not found"),
                {
                    statusCode: 404
                }
            );

            mockFindUserByIdOrFail.mockRejectedValue(error);

            await expect(getPublicUserProfileById(999)).rejects.toBe(error);

            expect(mockFormatPublicUser).not.toHaveBeenCalled();

            expect(Event.count).not.toHaveBeenCalled();

            expect(EventUserRole.count).not.toHaveBeenCalled();
        });
    });

    /* =============================
       UNEXPECTED ERRORS
    ============================= */

    describe("Unexpected errors", () => {
        it("propagates user lookup errors", async () => {
            const error = new Error("User lookup failed");

            mockFindUserByIdOrFail.mockRejectedValue(error);

            await expect(getPublicUserProfileById(10)).rejects.toBe(error);

            expect(Event.count).not.toHaveBeenCalled();

            expect(EventUserRole.count).not.toHaveBeenCalled();
        });

        it("propagates created event count errors", async () => {
            const error = new Error("Created event count failed");

            Event.count.mockRejectedValue(error);

            await expect(getPublicUserProfileById(10)).rejects.toBe(error);

            expect(mockFormatPublicUser).not.toHaveBeenCalled();
        });

        it("propagates joined event count errors", async () => {
            const error = new Error("Joined event count failed");

            EventUserRole.count.mockRejectedValue(error);

            await expect(getPublicUserProfileById(10)).rejects.toBe(error);

            expect(mockFormatPublicUser).not.toHaveBeenCalled();
        });

        it("propagates public user formatting errors", async () => {
            const error = new Error("Public user formatting failed");

            mockFormatPublicUser.mockImplementation(() => {
                throw error;
            });

            await expect(getPublicUserProfileById(10)).rejects.toBe(error);

            expect(Event.count).toHaveBeenCalledTimes(1);

            expect(EventUserRole.count).toHaveBeenCalledTimes(1);
        });
    });
});
