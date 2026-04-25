const User = require("../../../src/models/userModel");

const authService = require("../../../src/services/authService");

/**
 * Auth Service - Profile
 *
 * Tests user profile retrieval and update logic.
 *
 * Ensures user data is correctly fetched and modified.
*/

jest.mock("../../../src/models/userModel", () => ({
    findByPk: jest.fn()
}));

describe("authService - profile", () => {
    const user = {
        id: 1,
        name: "John",
        email: "john@test.com",
        save: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getUserProfileByID", () => {
        it("should return user", async () => {
            User.findByPk.mockResolvedValue(user);

            const result = await authService.getUserProfileByID(1);

            expect(result).toBe(user);
        });

        it("should throw if not found", async () => {
            User.findByPk.mockResolvedValue(null);

            await expect(authService.getUserProfileByID(1)).rejects.toMatchObject({ statusCode: 404 });
        });
    });

    describe("updateUserProfileByID", () => {
        it("should update user", async () => {
            User.findByPk.mockResolvedValue(user);

            const result = await authService.updateUserProfileByID(1, {
                name: "Updated",
                email: " UPDATED@TEST.COM "
            });

            expect(user.name).toBe("Updated");
            expect(user.email).toBe("updated@test.com");
            expect(user.save).toHaveBeenCalled();
            expect(result).toBe(user);
        });

        it("should throw if user not found", async () => {
            User.findByPk.mockResolvedValue(null);

            await expect(authService.updateUserProfileByID(1, {})).rejects.toMatchObject({ statusCode: 404 });
        });
    });
});