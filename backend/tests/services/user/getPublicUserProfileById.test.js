const User = require("../../../src/models/userModel");
const Event = require("../../../src/models/eventModel");
const EventUserRole = require("../../../src/models/relations/eventUserRoleModel");

const userService = require("../../../src/services/userService");

/**
 * User Service - Public Profile
 *
 * Tests public user profile retrieval logic.
 *
 * Ensures only public user data is returned
 * and user stats are correctly computed.
 */

jest.mock("../../../src/models/userModel", () => ({
    findByPk: jest.fn()
}));

jest.mock("../../../src/models/eventModel", () => ({
    count: jest.fn()
}));

jest.mock("../../../src/models/relations/eventUserRoleModel.js", () => ({
    count: jest.fn()
}));

describe("userService - getPublicUserProfileById", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return public user profile with stats", async () => {
        const user = {
            name: "John",
            avatar: "/uploads/avatars/john.png"
        };

        User.findByPk.mockResolvedValue(user);
        Event.count.mockResolvedValue(3);
        EventUserRole.count.mockResolvedValue(5);

        const result = await userService.getPublicUserProfileById(1);

        expect(User.findByPk).toHaveBeenCalledWith(1, {
            attributes: ["name", "avatar"]
        });

        expect(Event.count).toHaveBeenCalledWith({
            where: { creatorId: 1 }
        });

        expect(EventUserRole.count).toHaveBeenCalledWith({
            where: { userId: 1 }
        });

        expect(result).toEqual({
            user,
            stats: {
                createdEventsCount: 3,
                joinedEventsCount: 5
            }
        });
    });

    it("should return public user profile with null avatar", async () => {
        const user = {
            name: "John",
            avatar: null
        };

        User.findByPk.mockResolvedValue(user);
        Event.count.mockResolvedValue(0);
        EventUserRole.count.mockResolvedValue(0);

        const result = await userService.getPublicUserProfileById(1);

        expect(result.user).toEqual({
            name: "John",
            avatar: null
        });

        expect(result.stats).toEqual({
            createdEventsCount: 0,
            joinedEventsCount: 0
        });
    });

    it("should throw if user is not found", async () => {
        User.findByPk.mockResolvedValue(null);

        await expect(userService.getPublicUserProfileById(1))
            .rejects
            .toMatchObject({
                statusCode: 404,
                message: "User not found"
            });

        expect(Event.count).not.toHaveBeenCalled();
        expect(EventUserRole.count).not.toHaveBeenCalled();
    });
});
