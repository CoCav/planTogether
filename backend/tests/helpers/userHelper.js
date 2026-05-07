/* ==================================================
   USER TEST HELPERS

   Handles:
   - user lookup helpers
   - reusable user database access in tests

   Notes:
   - shared across integration tests
   - useful when tests need database user IDs after registration
================================================== */

const { User } = require("../../src/models");

// Retrieve user ID from database using email
const getUserIdByEmail = async (email) => {
    const user = await User.findOne({
        where: { email }
    });

    if (!user) {
        throw new Error(`Test user not found for email: ${email}`);
    }

    return user.id;
};

module.exports = { getUserIdByEmail };
