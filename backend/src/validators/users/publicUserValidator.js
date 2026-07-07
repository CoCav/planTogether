const { query } = require("express-validator");

const { publicUserIdParamValidator } = require("../shared/paramValidators");
const { pageQueryValidator, pageSizeQueryValidator } = require("../shared/paginationValidators");
const { orderQueryValidator, createSortByValidator } = require("../shared/sortValidators");
const {
    statusQueryValidator,
    modeQueryValidator,
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
   Public User Validators

   Validates public user requests.

   Responsibilities
   - Validate public user IDs
   - Validate public user event queries

   Notes
   - /:id routes validate public user IDs.
   - handleValidationErrors must run after these validators.
=========================================================================== */

const PUBLIC_USER_EVENT_VIEWS = [
    "created",
    "joined"
];

const PUBLIC_USER_EVENT_SORT_FIELDS = [
    "startDateTime",
    "title",
    "createdAt"
];

const getPublicUserEventsValidator = [
    query("view")
        .optional()
        .isIn(PUBLIC_USER_EVENT_VIEWS)
        .withMessage("View must be one of: created, joined"),

    statusQueryValidator,
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
        PUBLIC_USER_EVENT_SORT_FIELDS,
        "Sort field must be one of: startDateTime, title, createdAt"
    ),

    orderQueryValidator
];

module.exports = {
    publicUserIdParamValidator,
    getPublicUserEventsValidator
};
