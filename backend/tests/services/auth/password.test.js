const bcrypt = require("bcrypt");
const User = require("../../../src/models/userModel");

const authService = require("../../../src/services/authService");

/**
 * Auth Service - Password
 *
 * Tests password update logic.
 *
 * Ensures password rules and security checks are enforced.
*/

jest.mock("bcrypt");

jest.mock("../../../src/models/userModel", () => ({
    scope: jest.fn()
}));

describe("authService - changeUserPasswordByID", () => {
    const user = {
        id: 1,
        password: "hashed",
        save: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should change password", async () => {
        User.scope.mockReturnValue({
            findByPk: jest.fn().mockResolvedValue(user)
        });

        bcrypt.compare
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(false);

        bcrypt.hash.mockResolvedValue("new-hash");

        await authService.changeUserPasswordByID(1, "old", "new");

        expect(user.password).toBe("new-hash");
        expect(user.save).toHaveBeenCalled();
    });

    it("should throw if user not found", async () => {
        User.scope.mockReturnValue({
            findByPk: jest.fn().mockResolvedValue(null)
        });

        await expect(
            authService.changeUserPasswordByID(1, "a", "b")
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("should throw if current password invalid", async () => {
        User.scope.mockReturnValue({
            findByPk: jest.fn().mockResolvedValue(user)
        });

        bcrypt.compare.mockResolvedValueOnce(false);

        await expect(
            authService.changeUserPasswordByID(1, "a", "b")
        ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("should throw if same password", async () => {
        User.scope.mockReturnValue({
            findByPk: jest.fn().mockResolvedValue(user)
        });

        bcrypt.compare
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true);

        await expect(
            authService.changeUserPasswordByID(1, "a", "a")
        ).rejects.toMatchObject({ statusCode: 400 });
    });
});