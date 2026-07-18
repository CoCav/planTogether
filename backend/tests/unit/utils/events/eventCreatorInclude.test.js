const { Op } = require("sequelize");

const { EVENT_CREATOR_ATTRIBUTES } = require("../../../../src/constants/userAttributes");

const { buildEventCreatorInclude } = require("../../../../src/utils/events/eventCreatorInclude");

/* ==========================================================================
   Event Creator Include Utility Unit Tests

   Tests Sequelize creator include building.

   Responsibilities
   - Test default creator include structure
   - Test shared creator attributes
   - Test creator name filtering
   - Test creator query sanitization
   - Test required join behavior when filtering

   Notes
   - Creator filtering uses a case-insensitive partial match.
=========================================================================== */

describe("event creator include utility", () => {
    const User = {
        name: "UserModel"
    };

    /* =============================
       DEFAULT INCLUDE
    ============================= */

    describe("buildEventCreatorInclude without filter", () => {
        it("builds the default creator include", () => {
            const result = buildEventCreatorInclude(User);

            expect(result).toEqual({
                model: User,
                as: "creator",
                attributes: EVENT_CREATOR_ATTRIBUTES
            });
        });

        it("does not add filtering options when creator is omitted", () => {
            const result = buildEventCreatorInclude(User, undefined);

            expect(result).not.toHaveProperty("where");
            expect(result).not.toHaveProperty("required");
        });

        it("does not add filtering options for an empty creator value", () => {
            const result = buildEventCreatorInclude(User, "");

            expect(result).not.toHaveProperty("where");
            expect(result).not.toHaveProperty("required");
        });

        it("does not add filtering options for a whitespace-only creator value", () => {
            const result = buildEventCreatorInclude(User, "   ");

            expect(result).not.toHaveProperty("where");
            expect(result).not.toHaveProperty("required");
        });
    });

    /* =============================
       CREATOR FILTER
    ============================= */

    describe("buildEventCreatorInclude with filter", () => {
        it("builds a case-insensitive partial creator name filter", () => {
            const result = buildEventCreatorInclude(User, "Jane");

            expect(result).toEqual({
                model: User,
                as: "creator",
                attributes: EVENT_CREATOR_ATTRIBUTES,
                where: {
                    name: {
                        [Op.iLike]: "%Jane%"
                    }
                },
                required: true
            });
        });

        it("trims the creator name before building the filter", () => {
            const result = buildEventCreatorInclude(User, "  Jane Doe  ");

            expect(result.where).toEqual({
                name: {
                    [Op.iLike]: "%Jane Doe%"
                }
            });

            expect(result.required).toBe(true);
        });

        it("converts non-string creator values before trimming", () => {
            const result = buildEventCreatorInclude(User, 42);

            expect(result.where).toEqual({
                name: {
                    [Op.iLike]: "%42%"
                }
            });
        });
    });
});
