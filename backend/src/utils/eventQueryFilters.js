const { Op } = require("sequelize");

/* ==================================================
   EVENT QUERY FILTERS

   Handles:
   - dynamic where clause building
   - status filtering (past / upcoming)
   - date overlap filtering
   - text search and category filters
   - creator include with optional filtering

   Notes:
   - designed to be reused across services
   - keeps controllers/services clean
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

// Build creator include with optional name filtering
const buildCreatorInclude = (User, creator) => ({
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

// Apply event status filtering (past / upcoming)
const applyStatusFilter = (whereConditions, status) => {
    if (!status) return;

    if (status === "upcoming") {
        addAndCondition(whereConditions, {
            endDateTime: { [Op.gte]: new Date() }
        });
    }

    if (status === "past") {
        addAndCondition(whereConditions, {
            endDateTime: { [Op.lt]: new Date() }
        });
    }
};


/* =============================
   DATE FILTERS (OVERLAP LOGIC)
============================= */

// Apply date filtering using overlap logic
const applyDateFilters = (whereConditions, { date, startDate, endDate }) => {

    // Single day filter
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

    // Range filter
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
   BASIC FILTERS
============================= */

// Apply simple filters (search, type, etc.)
const applyBasicEventFilters = (whereConditions, query = {}) => {
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

    // Full-text search on title + description
    if (search) {
        whereConditions[Op.or] = [
            { title: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } }
        ];
    }
};


/* =============================
   MAIN FILTER ENTRY POINT
============================= */

// Apply all filters to a where object
const applyEventQueryFilters = (whereConditions, query = {}, options = {}) => {
    const { includeStatus = true } = options;

    if (includeStatus) {
        applyStatusFilter(whereConditions, query.status);
    }

    applyDateFilters(whereConditions, query);
    applyBasicEventFilters(whereConditions, query);

    return whereConditions;
};

module.exports = { addAndCondition, buildCreatorInclude, applyStatusFilter, applyDateFilters, applyBasicEventFilters, applyEventQueryFilters };
