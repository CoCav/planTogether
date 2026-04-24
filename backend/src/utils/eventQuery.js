/* ==================================================
   EVENT QUERY HELPERS
   Helpers for building event-related database queries
================================================== */
const { Op } = require("sequelize");

/* =========================
   Adds condition to Op.and safely
========================= */
const addAndCondition = (whereConditions, condition) => {
    if (!whereConditions[Op.and]) {
        whereConditions[Op.and] = [];
    }

    whereConditions[Op.and].push(condition);
};

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

module.exports = { applyStatusFilter };