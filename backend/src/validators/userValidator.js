const { body, param, query } = require("express-validator");

const { PASSWORD_REQUIREMENTS, PASSWORD_MESSAGES } = require("../config/security/passwordPolicy");

const { VALID_EVENT_MODES } = require("../constants/eventModes");
const { VALID_EVENT_STATUS } = require("../constants/eventStatus");

/* ==================================================
   USER VALIDATORS

   Handles:
   - authenticated current user profile update validation
   - authenticated current user password update validation
   - authenticated current user events query validation
   - public user ID param validation

   Notes:
   - handleValidationErrors must run after these validators
   - /me routes use JWT userId and do not need param validation
   - /:id routes validate public user IDs
================================================== */
/* =============================
   AUTHENTICATED USER
============================= */

// Validate authenticated current user's events query params
const getCurrentUserEventsValidator = [
    query("view")
        .optional()
        .isIn(["created", "joined", "createdHistory", "joinedHistory"])
        .withMessage("View must be one of: created, joined, createdHistory, joinedHistory"),

    query("status")
        .optional()
        .isIn(VALID_EVENT_STATUS)
        .withMessage("Status must be upcoming, ongoing or past"),

    query("creatorId")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Creator ID must be a positive integer")
        .toInt(),

    query("creator")
        .optional()
        .trim(),

    query("mode")
        .optional()
        .isIn(VALID_EVENT_MODES)
        .withMessage("Mode must be online or in_person"),

    query("type")
        .optional()
        .trim(),

    query("theme")
        .optional()
        .trim(),

    query("location")
        .optional()
        .trim(),

    query("search")
        .optional()
        .trim(),

    query("date")
        .optional()
        .isISO8601()
        .withMessage("Date must be a valid ISO8601 date"),

    query("startDate")
        .optional()
        .isISO8601()
        .withMessage("Start date must be a valid ISO8601 date"),

    query("endDate")
        .optional()
        .isISO8601()
        .withMessage("End date must be a valid ISO8601 date"),

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer")
        .toInt(),

    query("pageSize")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Page size must be between 1 and 100")
        .toInt(),

    query("sortBy")
        .optional()
        .isIn(["startDateTime", "title", "createdAt"])
        .withMessage("Sort field must be one of: startDateTime, title, createdAt"),

    query("order")
        .optional()
        .toLowerCase()
        .isIn(["asc", "desc"])
        .withMessage("Order must be asc or desc")
];


// Validate authenticated current user profile update data
const updateCurrentUserProfileValidator = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage("Name must be at least 2 characters long"),

    body("email")
        .optional()
        .trim()
        .isEmail().withMessage("Invalid email")
        .normalizeEmail()
];


// Validate authenticated current user password update data
const changeCurrentUserPasswordValidator = [
    body("currentPassword")
        .notEmpty().withMessage("Current password is required"),

    body("newPassword")
        .notEmpty().withMessage("New password is required")
        .isLength({ min: PASSWORD_REQUIREMENTS.minLength })
        .withMessage(PASSWORD_MESSAGES.newPasswordMinLength)
        .matches(PASSWORD_REQUIREMENTS.hasNumber)
        .withMessage(PASSWORD_MESSAGES.newPasswordNumber)
        .matches(PASSWORD_REQUIREMENTS.hasUppercase)
        .withMessage(PASSWORD_MESSAGES.newPasswordUppercase)
        .matches(PASSWORD_REQUIREMENTS.hasLowercase)
        .withMessage(PASSWORD_MESSAGES.newPasswordLowercase)
];

/* =============================
   PUBLIC USER
============================= */

// Validate public user ID route param
const userIdParamValidator = [
    param("id")
        .isInt({ min: 1 }).withMessage("User ID must be a positive integer")
        .toInt()
];

module.exports = { getCurrentUserEventsValidator, updateCurrentUserProfileValidator, changeCurrentUserPasswordValidator, userIdParamValidator };
