const {
    EVENT_CREATOR_ATTRIBUTES,
    PUBLIC_USER_ATTRIBUTES,
    AUTHENTICATED_USER_ATTRIBUTES
} = require("../../../../src/constants/userAttributes");

const {
    buildPublicUserInclude,
    buildAuthenticatedUserInclude
} = require("../../../../src/utils/users/userInclude");

/* ==========================================================================
   User Include Utility Unit Tests

   Tests reusable Sequelize user include builders.

   Responsibilities
   - Test public user include building
   - Test authenticated user include building
   - Test shared user attribute selections
   - Test association aliases

   Notes
   - Public includes expose only public user attributes.
   - Authenticated includes expose the current user's private attributes.
=========================================================================== */

describe("user include utility", () => {
    const User = {
        name: "UserModel"
    };

    /* =============================
       PUBLIC USER INCLUDE
    ============================= */

    describe("buildPublicUserInclude", () => {
        it("builds a public user include", () => {
            const result = buildPublicUserInclude(User);

            expect(result).toEqual({
                model: User,
                as: "user",
                attributes: PUBLIC_USER_ATTRIBUTES
            });
        });

        it("uses the shared public user attribute selection", () => {
            const result = buildPublicUserInclude(User);

            expect(result.attributes).toBe(PUBLIC_USER_ATTRIBUTES);
        });
    });

    /* =============================
       AUTHENTICATED USER INCLUDE
    ============================= */

    describe("buildAuthenticatedUserInclude", () => {
        it("builds an authenticated user include", () => {
            const result = buildAuthenticatedUserInclude(User);

            expect(result).toEqual({
                model: User,
                attributes: AUTHENTICATED_USER_ATTRIBUTES
            });
        });

        it("uses the shared authenticated user attribute selection", () => {
            const result = buildAuthenticatedUserInclude(User);

            expect(result.attributes).toBe(AUTHENTICATED_USER_ATTRIBUTES);
        });

        it("does not define a custom association alias", () => {
            const result = buildAuthenticatedUserInclude(User);

            expect(result).not.toHaveProperty("as");
        });
    });

    /* =============================
       ATTRIBUTE ISOLATION
    ============================= */

    describe("Attribute isolation", () => {
        it("keeps public user attributes separate from event creator attributes", () => {
            const result = buildPublicUserInclude(User);

            expect(result.attributes).not.toBe(EVENT_CREATOR_ATTRIBUTES);

            expect(result.attributes).toEqual([
                "id",
                "name",
                "avatar"
            ]);
        });
    });
});
