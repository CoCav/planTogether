const { throwHttpError } = require("../errors/httpError");

/* ==========================================================================
   User Queries

   Provides reusable user database query helpers.

   Responsibilities
   - Find users by ID
   - Throw consistent "not found" errors

   Notes
   - The User model is injected to keep helpers reusable.
   - Additional Sequelize options (attributes, transaction, scope, etc.)
     can be passed through the options parameter.
=========================================================================== */

const USER_NOT_FOUND_ERROR = "User not found";

// Finds a user by ID or throws a 404 error.
const findUserByIdOrFail = async (User, userId, options = {}) => {
    const user = await User.findByPk(userId, options);

    if (!user) {
        throwHttpError(404, USER_NOT_FOUND_ERROR);
    }

    return user;
};

module.exports = {
    findUserByIdOrFail
};
