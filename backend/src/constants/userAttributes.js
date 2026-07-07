/* ==========================================================================
   User Attributes

   Defines reusable user attribute selections.

   Responsibilities
   - Centralize commonly selected user attributes
   - Keep user queries consistent across services

   Notes
   - Intended for Sequelize `attributes` selections.
=========================================================================== */

const EVENT_CREATOR_ATTRIBUTES = [
    "id",
    "name"
];

const PUBLIC_USER_ATTRIBUTES = [
    "id",
    "name",
    "avatar"
];

const PUBLIC_USER_PROFILE_ATTRIBUTES = [
    "name",
    "avatar"
];

const AUTHENTICATED_USER_ATTRIBUTES = [
    "id",
    "name",
    "email",
    "avatar"
];

module.exports = {
    EVENT_CREATOR_ATTRIBUTES,
    PUBLIC_USER_ATTRIBUTES,
    PUBLIC_USER_PROFILE_ATTRIBUTES,
    AUTHENTICATED_USER_ATTRIBUTES
};
