const { body, query } = require("express-validator");

const { PASSWORD_REQUIREMENTS, PASSWORD_MESSAGES } = require("../../config/security/passwordPolicy");

const { EVENT_SORT_FIELDS } = require("../../constants/eventSortFields");

const { pageQueryValidator, pageSizeQueryValidator } = require("../shared/paginationValidators");
const { orderQueryValidator, createSortByValidator } = require("../shared/sortValidators");
const {
    statusQueryValidator,
    modeQueryValidator,
    creatorIdQueryValidator,
    creatorQueryValidator,
    searchQueryValidator,
    typeQueryValidator,
    themeQueryValidator,
    locationQueryValidator,
    dateQueryValidator,
    startDateQueryValidator,
    endDateQueryValidator
} = require("../shared/queryValidators");

/* ==========================================================================
   Authenticated User Validators

   Validates authenticated user requests.

   Responsibilities
   - Validate current user event queries
   - Validate current user profile updates
   - Validate current user password updates

   Notes
   - /me routes use the authenticated user ID from JWT.
   - handleValidationErrors must run after these validators.
=========================================================================== */

const CURRENT_USER_EVENT_VIEWS = [
    "created",
    "joined",
    "createdHistory",
    "joinedHistory"
];

const getCurrentUserEventsValidator = [
    query("view")
        .optional()
        .isIn(CURRENT_USER_EVENT_VIEWS)
        .withMessage("View must be one of: created, joined, createdHistory, joinedHistory"),

    statusQueryValidator,
    creatorIdQueryValidator,
    creatorQueryValidator,
    modeQueryValidator,
    typeQueryValidator,
    themeQueryValidator,
    locationQueryValidator,
    searchQueryValidator,
    dateQueryValidator,
    startDateQueryValidator,
    endDateQueryValidator,

    pageQueryValidator,
    pageSizeQueryValidator,

    createSortByValidator(
        EVENT_SORT_FIELDS,
        "Sort field must be one of: startDateTime, title, createdAt"
    ),

    orderQueryValidator
];

const updateCurrentUserProfileValidator = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage("Name must be at least 2 characters long"),

    body("email")
        .optional()
        .trim()
        .isEmail()
        .withMessage("Invalid email")
        .normalizeEmail()
];

const changeCurrentUserPasswordValidator = [
    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),

    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: PASSWORD_REQUIREMENTS.minLength })
        .withMessage(PASSWORD_MESSAGES.newPasswordMinLength)
        .matches(PASSWORD_REQUIREMENTS.hasNumber)
        .withMessage(PASSWORD_MESSAGES.newPasswordNumber)
        .matches(PASSWORD_REQUIREMENTS.hasUppercase)
        .withMessage(PASSWORD_MESSAGES.newPasswordUppercase)
        .matches(PASSWORD_REQUIREMENTS.hasLowercase)
        .withMessage(PASSWORD_MESSAGES.newPasswordLowercase)
];

module.exports = {
    getCurrentUserEventsValidator,
    updateCurrentUserProfileValidator,
    changeCurrentUserPasswordValidator
};
