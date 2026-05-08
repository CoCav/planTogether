/* ==================================================
   USER SERVICE - GET CURRENT USER PROFILE BY ID TESTS

   Tests:
   - current user profile retrieval
   - missing user rejection
   - database error forwarding

   Ensures:
   - current user profile data is retrieved correctly
   - missing users are handled safely
   - database errors are forwarded correctly
================================================== */

const User = require("../../../../../src/models/userModel");

const userService = require("../../../../../src/services/userService");

jest.mock("../../../../../src/models/userModel", () => ({
    findByPk: jest.fn()
}));

describe("userService - getCurrentUserProfileByID", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    /* ==================================
       CURRENT PROFILE RETRIEVAL SUCCESS
    ==================================== */

    it("should return current user profile", async () => {
        const user = {
            id: 1,
            name: "John",
            email: "john@test.com",
            avatar: null
        };

        User.findByPk.mockResolvedValue(user);

        const result = await userService.getCurrentUserProfileByID(1);

        expect(User.findByPk).toHaveBeenCalledWith(1);
        expect(result).toBe(user);
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should throw 404 when user profile is not found", async () => {
        User.findByPk.mockResolvedValue(null);

        await expect(userService.getCurrentUserProfileByID(1)).rejects.toMatchObject({
            message: "User not found",
            statusCode: 404
        });
    });

    /* =============================
       DATABASE ERRORS
    ============================= */

    it("should forward profile retrieval database errors", async () => {
        User.findByPk.mockRejectedValue(new Error("DB error"));

        await expect(userService.getCurrentUserProfileByID(1)).rejects.toThrow("DB error");
    });
});
