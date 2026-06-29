const { Op } = require("sequelize");

const { EVENT_STATUS } = require("../../constants/eventStatus");
const { EVENT_ROLES } = require("../../constants/eventRoles");

/* ==================================================
   EVENT QUERY BUILDER

   Handles:
   - dynamic Sequelize where clause building
   - event status filtering (upcoming / ongoing / past)
   - event date overlap filtering
   - text search and category filters
   - event creator include with optional filtering
   - active participant include building
   - optimized participant count attribute building
   - review stats include building
   - review count and average rating attributes
   - grouped active participant count queries
   - like stats include building
   - like count attribute

   Notes:
   - designed to be reused across services
   - participant count queries exclude soft-deleted memberships
   - grouped participant counts avoid N+1 queries
   - participant and review count attributes use COUNT DISTINCT
   - participant includes exclude soft-deleted memberships
   - review stats use event review ratings
   - keeps controllers/services clean
   - mutates the provided whereConditions object
   - like count attributes use COUNT DISTINCT
================================================== */

/* =============================
   AND CONDITION HELPER
============================= */

// Safely append a condition to Op.and
const addAndCondition = (whereConditions, condition) => {
    if (!whereConditions[Op.and]) {
        whereConditions[Op.and] = [];
    }

    whereConditions[Op.and].push(condition);
};


/* =============================
   CREATOR INCLUDE BUILDER
============================= */

// Build event creator include with optional name filtering
const buildEventCreatorInclude = (User, creator) => ({
    model: User,
    as: "creator",
    attributes: ["id", "name"],

    // Apply name filter only if provided
    ...(creator && {
        where: {
            name: {
                [Op.iLike]: `%${String(creator).trim()}%`
            }
        },
        required: true // forces INNER JOIN for filtering
    })
});


/* =============================
   STATUS FILTER
============================= */

// Apply event status filtering (upcoming / ongoing / past)
const applyEventStatusFilter = (whereConditions, status) => {
    if (!status) return;

    const now = new Date();

    if (status === EVENT_STATUS.UPCOMING) {
        addAndCondition(whereConditions, {
            startDateTime: { [Op.gt]: now }
        });
    }

    if (status === EVENT_STATUS.ONGOING) {
        addAndCondition(whereConditions, {
            startDateTime: { [Op.lte]: now }
        });

        addAndCondition(whereConditions, {
            endDateTime: { [Op.gte]: now }
        });
    }

    if (status === EVENT_STATUS.PAST) {
        addAndCondition(whereConditions, {
            endDateTime: { [Op.lt]: now }
        });
    }
};

/* =============================
   DATE FILTERS (OVERLAP LOGIC)
============================= */

// Apply event date filtering using overlap logic
const applyEventDateFilters = (whereConditions, { date, startDate, endDate }) => {
    if (date) {
        const start = new Date(`${date}T00:00:00.000`);
        const end = new Date(`${date}T23:59:59.999`);

        addAndCondition(whereConditions, {
            startDateTime: { [Op.lte]: end }
        });

        addAndCondition(whereConditions, {
            endDateTime: { [Op.gte]: start }
        });

        return;
    }

    if (startDate || endDate) {
        const start = startDate ? new Date(`${startDate}T00:00:00.000`) : null;
        const end = endDate ? new Date(`${endDate}T23:59:59.999`) : null;

        if (start && end) {
            addAndCondition(whereConditions, {
                startDateTime: { [Op.lte]: end }
            });

            addAndCondition(whereConditions, {
                endDateTime: { [Op.gte]: start }
            });
        } else if (start) {
            addAndCondition(whereConditions, {
                startDateTime: { [Op.gte]: start }
            });
        } else if (end) {
            addAndCondition(whereConditions, {
                startDateTime: { [Op.lte]: end }
            });
        }
    }
};


/* =============================
   BASIC EVENT FILTERS
============================= */

// Apply basic event filters (search, type, theme, etc.)
const applyEventBasicFilters = (whereConditions, query = {}) => {
    const {
        creatorId,
        type,
        theme,
        location,
        mode,
        search
    } = query;

    if (creatorId) whereConditions.creatorId = parseInt(creatorId, 10);
    if (mode) whereConditions.mode = String(mode).trim();
    if (type) whereConditions.type = { [Op.iLike]: `%${type}%` };
    if (theme) whereConditions.theme = { [Op.iLike]: `%${theme}%` };
    if (location) whereConditions.location = { [Op.iLike]: `%${location}%` };

    // Search on title + description
    if (search) {
        whereConditions[Op.or] = [
            { title: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } }
        ];
    }
};


/* =============================
   MAIN QUERY BUILDER
============================= */

// Build all event where conditions from query params
const buildEventWhereConditions = (whereConditions, query = {}, options = {}) => {
    const { includeStatus = true } = options;

    if (includeStatus) {
        applyEventStatusFilter(whereConditions, query.status);
    }

    applyEventDateFilters(whereConditions, query);
    applyEventBasicFilters(whereConditions, query);

    return whereConditions;
};

/* =============================
   PARTICIPANT COUNT HELPERS
============================= */

// Build active participant include used for participant counts
const buildActiveParticipantInclude = (User) => ({
    model: User,
    as: "participants",
    attributes: [],
    through: {
        attributes: [],
        where: {
            role: EVENT_ROLES.PARTICIPANT,
            deletedAt: null
        }
    },
    required: false
});

// Build participant count attribute with DISTINCT to avoid duplicate counts
const buildParticipantCountAttribute = (sequelize, participantIdPath) => ([
    sequelize.fn(
        "COUNT",
        sequelize.fn(
            "DISTINCT",
            sequelize.col(participantIdPath)
        )
    ),
    "participantCount"
]);

// Count active participants for multiple events in one grouped query
const countActiveParticipantsByEventIds = async (EventUserRole, sequelize, eventIds) => {
    if (!eventIds.length) {
        return {};
    }

    const participantCounts = await EventUserRole.findAll({
        attributes: [
            "eventId",
            [
                sequelize.fn("COUNT", sequelize.col("eventId")),
                "participantCount"
            ]
        ],
        where: {
            eventId: {
                [Op.in]: eventIds
            },
            role: EVENT_ROLES.PARTICIPANT,
            deletedAt: null
        },
        group: ["eventId"],
        raw: true
    });

    return participantCounts.reduce((acc, item) => {
        acc[item.eventId] = Number(item.participantCount);
        return acc;
    }, {});
};

/* =============================
   REVIEW STATS HELPERS
============================= */

// Build review include used for review stats
const buildEventReviewInclude = (EventReview) => ({
    model: EventReview,
    as: "reviews",
    attributes: [],
    required: false
});

// Build review count attribute with DISTINCT to avoid duplicate counts
const buildReviewCountAttribute = (sequelize, reviewIdPath) => ([
    sequelize.fn(
        "COUNT",
        sequelize.fn(
            "DISTINCT",
            sequelize.col(reviewIdPath)
        )
    ),
    "reviewCount"
]);

// Build average rating attribute from event reviews
const buildAverageRatingAttribute = (sequelize, ratingPath) => ([
    sequelize.fn(
        "ROUND",
        sequelize.cast(
            sequelize.fn("AVG", sequelize.col(ratingPath)),
            "numeric"
        ),
        1
    ),
    "averageRating"
]);

/* =============================
   LIKE STATS HELPERS
============================= */

// Build like include used for like stats
const buildEventLikeInclude = (EventLike) => ({
    model: EventLike,
    as: "likes",
    attributes: [],
    required: false
});

// Build like count attribute with DISTINCT to avoid duplicate counts
const buildLikeCountAttribute = (sequelize, likeIdPath) => ([
    sequelize.fn(
        "COUNT",
        sequelize.fn(
            "DISTINCT",
            sequelize.col(likeIdPath)
        )
    ),
    "likesCount"
]);

module.exports = {
    addAndCondition,
    buildEventCreatorInclude,

    applyEventStatusFilter,

    applyEventDateFilters,

    applyEventBasicFilters,

    buildEventWhereConditions,

    buildActiveParticipantInclude,
    buildParticipantCountAttribute,
    countActiveParticipantsByEventIds,

    buildEventReviewInclude,
    buildReviewCountAttribute,
    buildAverageRatingAttribute,

    buildEventLikeInclude,
    buildLikeCountAttribute
};
