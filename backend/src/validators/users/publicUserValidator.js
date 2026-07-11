const { query } = require("express-validator");

const { EVENT_SORT_FIELDS } = require("../../constants/eventSortFields");

const { publicUserIdParamValidator } = require("../shared/paramsValidators");
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
        EVENT_SORT_FIELDS,
        "Sort field must be one of: startDateTime, title, createdAt"
    ),

    orderQueryValidator
];

module.exports = {
    publicUserIdParamValidator,
    getPublicUserEventsValidator
};
