/* ==================================================
   EVENT QUERY FILTERS
   Helpers for building event-related database queries

   Handles:
   - dynamic where conditions
   - date and status filters
   - text and category filters
   - reusable includes (creator)
================================================== */

const { Op } = require("sequelize");

/* =========================
   Adds condition to Op.and safely
   Ensures multiple conditions are grouped properly
========================= */
const addAndCondition = (whereConditions, condition) => {
    if (!whereConditions[Op.and]) {
        whereConditions[Op.and] = [];
    }

    whereConditions[Op.and].push(condition);
};


/* =========================
   Creator include builder
   Adds creator relation with optional name filter

   - used for filtering by creator name
   - works with nested includes (EventUserRole → Event → User)
========================= */
const buildCreatorInclude = (User, creator) => ({
    model: User,
    as: "creator",
    attributes: ["id", "name"],
    ...(creator && {
        where: {
            name: {
                [Op.iLike]: `%${String(creator).trim()}%`
            }
        },
        required: true // ensures filtering works (INNER JOIN)
    })
});


/* =========================
   Applies status filter
   - upcoming: events not finished yet
   - past: events already finished
========================= */
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


/* =========================
   Applies date filter
   Uses overlap logic so multi-day events are included
========================= */
const applyDateFilters = (whereConditions, { date, startDate, endDate }) => {
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


/* =========================
   Applies text and category filters
   Handles basic search and field matching
========================= */
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

    if (search) {
        whereConditions[Op.or] = [
            { title: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } }
        ];
    }
};


/* =========================
   Applies all common event filters
   Used by:
   - public event listing
   - user event listing

   Options:
   - includeStatus: apply status filter (default true)
========================= */
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
