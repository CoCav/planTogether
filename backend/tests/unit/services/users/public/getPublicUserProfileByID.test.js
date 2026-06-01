/* ==================================================
   USER SERVICE - GET PUBLIC USER PROFILE BY ID TESTS

   Tests:
   - public profile retrieval
   - public stats computation
   - active joined events count
   - null avatar handling
   - missing user rejection
   - database error propagation

   Ensures:
   - only public user fields are selected
   - user statistics are computed correctly
   - joined event stats only count active non-organizer memberships
   - null avatars are handled safely
   - missing users and database errors are handled safely
================================================== */

jest.mock("../../../../../src/models/userModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../../../src/models/eventModel", () => ({
    count: jest.fn()
}));

jest.mock("../../../../../src/models/relations/eventUserRoleModel", () => ({
    count: jest.fn()
}));

const { Op } = require("sequelize");

const User = require("../../../../../src/models/userModel");
const Event = require("../../../../../src/models/eventModel");
const EventUserRole = require("../../../../../src/models/relations/eventUserRoleModel");

const userService = require("../../../../../src/services/userService");

const { EVENT_ROLES } = require("../../../../../src/constants/eventRoles");

const { createMockUser } = require("../../../../factories/userFactory");

describe("userService - getPublicUserProfileByID", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       PUBLIC PROFILE RETRIEVAL SUCCESS
    ============================= */

    it("should return public user profile with stats", async () => {
        const user = createMockUser({
            name: "John",
            avatar: "/uploads/avatars/john.png"
        });

        User.findByPk.mockResolvedValue(user);
        Event.count.mockResolvedValue(3);
        EventUserRole.count.mockResolvedValue(5);

        const result = await userService.getPublicUserProfileByID(1);

        expect(User.findByPk).toHaveBeenCalledWith(1, {
            attributes: ["name", "avatar"]
        });

        expect(result).toEqual({
            user: {
                name: "John",
                avatar: "/uploads/avatars/john.png"
            },
            stats: {
                createdEventsCount: 3,
                joinedEventsCount: 5
            }
        });
    });

    /* =============================
       PUBLIC STATS
    ============================= */

    it("should compute public user stats", async () => {
        const user = createMockUser({
            name: "John",
            avatar: null
        });

        User.findByPk.mockResolvedValue(user);
        Event.count.mockResolvedValue(2);
        EventUserRole.count.mockResolvedValue(4);

        const result = await userService.getPublicUserProfileByID(1);

        expect(Event.count).toHaveBeenCalledWith({
            where: { creatorId: 1 }
        });

        expect(EventUserRole.count).toHaveBeenCalledWith({
            where: {
                userId: 1,
                deletedAt: null,
                role: {
                    [Op.ne]: EVENT_ROLES.ORGANIZER
                }
            }
        });

        expect(result.stats).toEqual({
            createdEventsCount: 2,
            joinedEventsCount: 4
        });
    });

    it("should exclude organizer memberships from joined event stats", async () => {
        const user = createMockUser({
            name: "John",
            avatar: null
        });

        User.findByPk.mockResolvedValue(user);
        Event.count.mockResolvedValue(2);
        EventUserRole.count.mockResolvedValue(3);

        await userService.getPublicUserProfileByID(1);

        expect(EventUserRole.count).toHaveBeenCalledWith({
            where: {
                userId: 1,
                deletedAt: null,
                role: {
                    [Op.ne]: EVENT_ROLES.ORGANIZER
                }
            }
        });
    });

    it("should return public user profile with null avatar", async () => {
        const user = createMockUser({
            name: "John",
            avatar: null
        });

        User.findByPk.mockResolvedValue(user);
        Event.count.mockResolvedValue(0);
        EventUserRole.count.mockResolvedValue(0);

        const result = await userService.getPublicUserProfileByID(1);

        expect(result.user).toMatchObject({
            name: "John",
            avatar: null
        });

        expect(result.stats).toEqual({
            createdEventsCount: 0,
            joinedEventsCount: 0
        });
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 when user is not found", async () => {
        User.findByPk.mockResolvedValue(null);

        await expect(userService.getPublicUserProfileByID(1)).rejects.toMatchObject({
            statusCode: 404,
            message: "User not found"
        });

        expect(Event.count).not.toHaveBeenCalled();
        expect(EventUserRole.count).not.toHaveBeenCalled();
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should forward database errors", async () => {
        User.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(userService.getPublicUserProfileByID(1)).rejects.toThrow("DB error");
    });
});
