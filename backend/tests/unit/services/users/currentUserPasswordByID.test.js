/* ==================================================
   USER SERVICE - GET CURRENT USER PASSWORD BY ID TESTS

   Tests:
   - successful password update
   - missing user rejection
   - invalid current password rejection
   - same password rejection
   - password hashing before save

   Ensures:
   - password updates follow security rules
   - current password verification is enforced
   - passwords are always hashed before persistence
================================================== */

const bcrypt = require("bcrypt");
const User = require("../../../../src/models/userModel");

const userService = require("../../../../src/services/userService");

jest.mock("bcrypt");

jest.mock("../../../../src/models/userModel", () => ({
    scope: jest.fn()
}));

describe("userService - getCurrentUserPasswordByID", () => {
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
            .mockResolvedValueOnce(true) // Current password matches
            .mockResolvedValueOnce(false); // New password differs

        bcrypt.hash.mockResolvedValue("new-hash");

        await userService.changeCurrentUserPasswordByID(1, "old", "new");

        expect(user.password).toBe("new-hash");
        expect(user.save).toHaveBeenCalled();
    });

    it("should hash new password before saving", async () => {
        User.scope.mockReturnValue({
            findByPk: jest.fn().mockResolvedValue(user)
        });

        bcrypt.compare
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(false);

        bcrypt.hash.mockResolvedValue("new-hash");

        await userService.changeCurrentUserPasswordByID(1, "old", "new");

        expect(bcrypt.hash).toHaveBeenCalledWith("new", 10);
    });

    it("should throw if user is not found", async () => {
        User.scope.mockReturnValue({
            findByPk: jest.fn().mockResolvedValue(null)
        });

        await expect(userService.changeCurrentUserPasswordByID(1, "a", "b")).rejects.toMatchObject({ statusCode: 404 });
    });

    it("should throw if current password is invalid", async () => {
        User.scope.mockReturnValue({
            findByPk: jest.fn().mockResolvedValue(user)
        });

        bcrypt.compare.mockResolvedValueOnce(false);

        await expect(userService.changeCurrentUserPasswordByID(1, "a", "b")).rejects.toMatchObject({ statusCode: 401 });
    });

    it("should throw if new password is identical to current password", async () => {
        User.scope.mockReturnValue({
            findByPk: jest.fn().mockResolvedValue(user)
        });

        bcrypt.compare
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true);

        await expect(userService.changeCurrentUserPasswordByID(1, "a", "a")).rejects.toMatchObject({ statusCode: 400 });
    });
});
