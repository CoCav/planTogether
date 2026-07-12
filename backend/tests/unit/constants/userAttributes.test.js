const {
    EVENT_CREATOR_ATTRIBUTES,
    PUBLIC_USER_ATTRIBUTES,
    PUBLIC_USER_PROFILE_ATTRIBUTES,
    AUTHENTICATED_USER_ATTRIBUTES
} = require("../../../src/constants/userAttributes");

/* ==========================================================================
   User Attribute Constants Unit Tests

   Tests shared user attribute selections.

   Responsibilities
   - Test event creator attributes
   - Test public user attributes
   - Test public user profile attributes
   - Test authenticated user attributes

   Notes
   - Shared attribute selections keep Sequelize queries consistent.
=========================================================================== */

describe("userAttributes constants", () => {

    /* =============================
       EVENT CREATOR ATTRIBUTES
    ============================= */

    describe("Event creator attributes", () => {
        it("exposes the event creator attribute selection", () => {
            expect(EVENT_CREATOR_ATTRIBUTES).toEqual([
                "id",
                "name"
            ]);
        });
    });

    /* =============================
       PUBLIC USER ATTRIBUTES
    ============================= */

    describe("Public user attributes", () => {
        it("exposes the public user attribute selection", () => {
            expect(PUBLIC_USER_ATTRIBUTES).toEqual([
                "id",
                "name",
                "avatar"
            ]);
        });

        it("exposes the public user profile attribute selection", () => {
            expect(PUBLIC_USER_PROFILE_ATTRIBUTES).toEqual([
                "name",
                "avatar"
            ]);
        });
    });

    /* =============================
       AUTHENTICATED USER ATTRIBUTES
    ============================= */

    describe("Authenticated user attributes", () => {
        it("exposes the authenticated user attribute selection", () => {
            expect(AUTHENTICATED_USER_ATTRIBUTES).toEqual([
                "id",
                "name",
                "email",
                "avatar"
            ]);
        });
    });
});
