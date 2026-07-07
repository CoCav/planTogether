const {
    PUBLIC_USER_ATTRIBUTES,
    AUTHENTICATED_USER_ATTRIBUTES
} = require("../../constants/userAttributes");

/* ==========================================================================
   User Include Utilities

   Builds Sequelize includes for user data.

   Responsibilities
   - Build public user includes
   - Build authenticated user includes

   Notes
   - Intended for Sequelize `include` definitions.
=========================================================================== */

const buildPublicUserInclude = (User) => ({
    model: User,
    as: "user",
    attributes: PUBLIC_USER_ATTRIBUTES
});

const buildAuthenticatedUserInclude = (User) => ({
    model: User,
    attributes: AUTHENTICATED_USER_ATTRIBUTES
});

module.exports = {
    buildPublicUserInclude,
    buildAuthenticatedUserInclude
};
