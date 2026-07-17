const { Op } = require("sequelize");

const { EVENT_CREATOR_ATTRIBUTES } = require("../../constants/userAttributes");

/* ==========================================================================
   Event Creator Include Utilities

   Builds Sequelize includes for event creator data.

   Responsibilities
   - Build event creator includes
   - Apply optional creator name filtering

   Notes
   - Creator filtering uses an INNER JOIN when a creator name is provided.
=========================================================================== */

/* =============================
   REVIEW QUERIES
============================= */

// Find a review by ID or throw a not found error
const buildEventCreatorInclude = (User, creator) => {
    const creatorSearch = String(creator ?? "").trim();

    return {
        model: User,
        as: "creator",
        attributes: EVENT_CREATOR_ATTRIBUTES,

        ...(creatorSearch && {
            where: {
                name: {
                    [Op.iLike]: `%${creatorSearch}%`
                }
            },
            required: true
        })
    };
};

module.exports = {
    buildEventCreatorInclude
};
