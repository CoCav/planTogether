/* ==================================================
   USER SERVICE - CHANGE CURRENT USER PASSWORD BY ID TESTS

   Tests:
   - successful password update
   - password hashing before save
   - missing user rejection
   - invalid current password rejection
   - same password rejection
   - database error propagation

   Ensures:
   - password updates follow security rules
   - current password verification is enforced
   - users cannot reuse their current password
   - passwords are always hashed before persistence
================================================== */

jest.mock("bcrypt");

jest.mock("../../../../../src/models/userModel", () => ({
    scope: jest.fn()
}));

const bcrypt = require("bcrypt");
const User = require("../../../../../src/models/userModel");

const userService = require("../../../../../src/services/userService");

const { createMockUserWithPassword } = require("../../../../factories/userFactory");

describe("userService - changeCurrentUserPasswordByID", () => {

    let user;

    beforeEach(() => {
        jest.clearAllMocks();

        user = createMockUserWithPassword({
            save: jest.fn()
        });
    });

    /* =============================
       PASSWORD UPDATE SUCCESS
    ============================= */

    it("should change password", async () => {
        User.scope.mockReturnValue({
            findByPk: jest.fn().mockResolvedValue(user)
        });

        bcrypt.compare
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(false);

        bcrypt.hash.mockResolvedValue("new-hash");

        await userService.changeCurrentUserPasswordById(1, "old", "new");

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

    /* =============================
       BUSINESS RULES
    ============================= */

    it("should throw 401 when current password is invalid", async () => {
        User.scope.mockReturnValue({
            findByPk: jest.fn().mockResolvedValue(user)
        });

        bcrypt.compare.mockResolvedValueOnce(false);

        await expect(userService.changeCurrentUserPasswordById(1, "wrong", "new")).rejects.toMatchObject({
            message: "Current password is incorrect",
            statusCode: 401
        });
    });

    it("should throw 400 when new password is identical to current password", async () => {
        User.scope.mockReturnValue({
            findByPk: jest.fn().mockResolvedValue(user)
        });

        bcrypt.compare
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(true);

        await expect(userService.changeCurrentUserPasswordById(1, "same", "same")).rejects.toMatchObject({
            message: "New password must be different from the current password",
            statusCode: 400
        });
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 when user is not found", async () => {
        User.scope.mockReturnValue({
            findByPk: jest.fn().mockResolvedValue(null)
        });

        await expect(userService.changeCurrentUserPasswordById(1, "old", "new")).rejects.toMatchObject({
            message: "User not found",
            statusCode: 404
        });
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should forward database errors", async () => {
        User.scope.mockReturnValue({
            findByPk: jest.fn().mockRejectedValue(new Error("DB error"))
        });

        await expect(userService.changeCurrentUserPasswordById(1, "old", "new")).rejects.toThrow("DB error");
    });
});
