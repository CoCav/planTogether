const { User } = require("../../../src/models");

/* ==========================================================================
   User Test Helper

   Builds reusable user lookup helpers for HTTP tests.

   Responsibilities
   - Find users by email
   - Retrieve user identifiers after registration
   - Support authenticated integration test setup

   Notes
   - Shared across integration tests.
   - Used when HTTP setup needs database user IDs.
=========================================================================== */

const findUserIdByEmail = async (email) => {
    const user = await User.findOne({
        where: {
            email
        }
    });

    if (!user) {
        throw new Error(`Test user not found for email: ${email}`);
    }

    return user.id;
};

module.exports = {
    findUserIdByEmail
};
