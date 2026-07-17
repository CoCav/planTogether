const {
    EVENT_ROLES,
    VALID_EVENT_ROLES,
    STAFF_EVENT_ROLES
} = require("../../../src/constants/eventRoles");

/* ==========================================================================
   Event Role Constants Unit Tests

   Tests shared event role constants.

   Responsibilities
   - Test supported event role values
   - Test the valid event role allowlist
   - Test staff event roles
=========================================================================== */

describe("eventRoles constants", () => {

    /* =============================
       EVENT ROLE VALUES
    ============================= */

    describe("Event role values", () => {
        it("exposes the supported event roles", () => {
            expect(EVENT_ROLES).toEqual({
                ORGANIZER: "organizer",
                CO_ORGANIZER: "co_organizer",
                PARTICIPANT: "participant"
            });
        });
    });

    /* =============================
       VALID EVENT ROLES
    ============================= */

    describe("Valid event roles", () => {
        it("includes every supported event role", () => {
            expect(VALID_EVENT_ROLES).toEqual([
                EVENT_ROLES.ORGANIZER,
                EVENT_ROLES.CO_ORGANIZER,
                EVENT_ROLES.PARTICIPANT
            ]);
        });
    });

    /* =============================
       STAFF EVENT ROLES
    ============================= */

    describe("Staff event roles", () => {
        it("includes organizer and co-organizer roles", () => {
            expect(STAFF_EVENT_ROLES).toEqual([
                EVENT_ROLES.ORGANIZER,
                EVENT_ROLES.CO_ORGANIZER
            ]);
        });

        it("does not include the participant role", () => {
            expect(STAFF_EVENT_ROLES).not.toContain(EVENT_ROLES.PARTICIPANT);
        });
    });
});
