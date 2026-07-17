const { Op } = require("sequelize");

const { EVENT_STATUS } = require("../../constants/eventStatus");

/* ==========================================================================
   Event Filters

   Builds Sequelize filters for event list queries.

   Responsibilities
   - Build dynamic event where conditions
   - Apply event status filters
   - Apply date overlap filters
   - Apply text, category and location filters

   Notes
   - Mutates the provided whereConditions object.
   - Date filters use overlap logic to include events spanning the selected period.
   - Sequelize operators are kept here because this file builds Sequelize where clauses.
=========================================================================== */

/* =============================
   DATE CONSTANTS
============================= */

const DAY_START_TIME = "T00:00:00.000";
const DAY_END_TIME = "T23:59:59.999";

/* =============================
   FILTER HELPERS
============================= */

// Append a condition to the shared Sequelize AND group
const addAndCondition = (whereConditions, condition) => {
    if (!whereConditions[Op.and]) {
        whereConditions[Op.and] = [];
    }

    whereConditions[Op.and].push(condition);
};

/* =============================
   STATUS FILTERS
============================= */

// Apply a lifecycle status filter
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
   DATE FILTERS
============================= */

// Apply single-day or date-range overlap filters
const applyEventDateFilters = (whereConditions, { date, startDate, endDate }) => {
    if (date) {
        const start = new Date(`${date}${DAY_START_TIME}`);
        const end = new Date(`${date}${DAY_END_TIME}`);

        // Include events that overlap the selected day, even if they started earlier
        addAndCondition(whereConditions, {
            startDateTime: { [Op.lte]: end }
        });

        addAndCondition(whereConditions, {
            endDateTime: { [Op.gte]: start }
        });

        return;
    }

    if (startDate || endDate) {
        const start = startDate ? new Date(`${startDate}${DAY_START_TIME}`) : null;
        const end = endDate ? new Date(`${endDate}${DAY_END_TIME}`) : null;

        if (start && end) {
            // Include events that overlap the selected date range
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
   SEARCH FILTERS
============================= */

// Apply event metadata and location search filters
const applyEventSearchFilters = (whereConditions, query = {}) => {
    const {
        creatorId,
        type,
        theme,
        location,
        city,
        region,
        country,
        mode,
        search
    } = query;

    if (creatorId) whereConditions.creatorId = parseInt(creatorId, 10);
    if (mode) whereConditions.mode = String(mode).trim();
    if (type) whereConditions.type = { [Op.iLike]: `%${type}%` };
    if (theme) whereConditions.theme = { [Op.iLike]: `%${theme}%` };

    const locationSearch = String(location ?? "").trim();

    if (locationSearch) {
        // Search both the display location and structured geocoding fields
        addAndCondition(whereConditions, {
            [Op.or]: [
                { location: { [Op.iLike]: `%${locationSearch}%` } },
                { locationLabel: { [Op.iLike]: `%${locationSearch}%` } },
                { streetAddress: { [Op.iLike]: `%${locationSearch}%` } },
                { city: { [Op.iLike]: `%${locationSearch}%` } },
                { region: { [Op.iLike]: `%${locationSearch}%` } },
                { country: { [Op.iLike]: `%${locationSearch}%` } }
            ]
        });
    }

    if (city) whereConditions.city = { [Op.iLike]: `%${city}%` };
    if (region) whereConditions.region = { [Op.iLike]: `%${region}%` };
    if (country) whereConditions.country = { [Op.iLike]: `%${country}%` };

    if (search) {
        whereConditions[Op.or] = [
            { title: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } }
        ];
    }
};

/* =============================
   EVENT WHERE BUILDER
============================= */

// Build all supported event where conditions
const buildEventWhereConditions = (whereConditions, query = {}, options = {}) => {
    const { includeStatus = true } = options;

    if (includeStatus) {
        applyEventStatusFilter(whereConditions, query.status);
    }

    applyEventDateFilters(whereConditions, query);
    applyEventSearchFilters(whereConditions, query);

    return whereConditions;
};

module.exports = {
    addAndCondition,
    applyEventStatusFilter,
    applyEventDateFilters,
    applyEventSearchFilters,
    buildEventWhereConditions
};
