const { findUserByIdOrFail } = require("../../../../src/utils/users/userQueries");

/* ==========================================================================
   User Query Utility Unit Tests

   Tests reusable user database query helpers.

   Responsibilities
   - Test user lookup by ID
   - Test Sequelize option forwarding
   - Test user result passthrough
   - Test user not found errors

   Notes
   - The User model is injected into the utility.
   - Entity existence errors use the shared HTTP error format.
=========================================================================== */

describe("user query utility", () => {
    const User = {
        findByPk: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    /* =============================
       USER LOOKUP SUCCESS
    ============================= */

    describe("findUserByIdOrFail success", () => {
        it("finds a user by ID", async () => {
            const user = {
                id: 10,
                name: "Jane Doe"
            };

            User.findByPk.mockResolvedValue(user);

            const result = await findUserByIdOrFail(User, 10);

            expect(User.findByPk).toHaveBeenCalledWith(10, {});

            expect(result).toBe(user);
        });

        it("forwards Sequelize query options", async () => {
            const user = {
                id: 10
            };

            const options = {
                attributes: [
                    "id",
                    "name"
                ],
                transaction: {
                    id: "transaction"
                }
            };

            User.findByPk.mockResolvedValue(user);

            const result = await findUserByIdOrFail(User, 10, options);

            expect(User.findByPk).toHaveBeenCalledWith(10, options);

            expect(result).toBe(user);
        });
    });

    /* =============================
       USER NOT FOUND
    ============================= */

    describe("findUserByIdOrFail failure", () => {
        it("throws a 404 error when the user does not exist", async () => {
            User.findByPk.mockResolvedValue(null);

            await expect(findUserByIdOrFail(User, 999)).rejects.toMatchObject({
                message: "User not found",
                statusCode: 404
            });
        });

        it("queries the requested user before throwing", async () => {
            const options = {
                transaction: {
                    id: "transaction"
                }
            };

            User.findByPk.mockResolvedValue(null);

            await expect(
                findUserByIdOrFail(
                    User,
                    999,
                    options
                )
            ).rejects.toThrow("User not found");

            expect(User.findByPk).toHaveBeenCalledWith(999, options);
        });
    });
});
