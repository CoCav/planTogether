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

const buildEventCreatorInclude = (User, creator) => ({
    model: User,
    as: "creator",
    attributes: EVENT_CREATOR_ATTRIBUTES,

    ...(creator && {
        where: {
            name: {
                [Op.iLike]: `%${String(creator).trim()}%`
            }
        },
        required: true
    })
});

module.exports = {
    buildEventCreatorInclude
};
