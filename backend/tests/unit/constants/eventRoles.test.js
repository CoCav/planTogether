/* ==================================================
   EVENT ROLE CONSTANTS TESTS

   Tests:
   - event role values
   - valid role allowlist

   Ensures:
   - shared event role constants stay consistent
   - valid role list contains all supported event roles
================================================== */

const { EVENT_ROLES, VALID_EVENT_ROLES } = require("../../../src/constants/eventRoles");

describe("eventRoles constants", () => {
    it("should expose supported event role values", () => {
        expect(EVENT_ROLES).toEqual({
            ORGANIZER: "organizer",
            CO_ORGANIZER: "co_organizer",
            PARTICIPANT: "participant"
        });
    });

    it("should expose all valid event roles", () => {
        expect(VALID_EVENT_ROLES).toEqual([
            EVENT_ROLES.ORGANIZER,
            EVENT_ROLES.CO_ORGANIZER,
            EVENT_ROLES.PARTICIPANT
        ]);
    });
});
