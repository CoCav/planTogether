const { Op } = require("sequelize");

/* ==========================================================================
   Event Creator Utilities

   Builds Sequelize includes for event creator data.

   Responsibilities
   - Build event creator includes
   - Apply optional creator name filtering

   Notes
   - Creator filtering uses an INNER JOIN when a creator name is provided.
=========================================================================== */

const USER_PUBLIC_ATTRIBUTES = ["id", "name"];

const buildEventCreatorInclude = (User, creator) => ({
    model: User,
    as: "creator",
    attributes: USER_PUBLIC_ATTRIBUTES,

    ...(creator && {
        where: {
            name: {
                [Op.iLike]: `%${String(creator).trim()}%`
            }
        },

        // Required forces INNER JOIN so creator name filtering works correctly.
        required: true
    })
});

module.exports = { buildEventCreatorInclude };
