/* ==================================================
   USER FORMATTER UTILITIES TESTS

   Tests:
   - authenticated user formatting
   - public user formatting
   - avatar fallback normalization

   Ensures:
   - authenticated responses expose expected fields
   - public responses hide sensitive fields
   - missing avatars are normalized to null
================================================== */

const { formatAuthenticatedUser, formatPublicUser } = require("../../../../src/utils/formatting/userFormatter");

const { createMockUserWithPassword } = require("../../../factories/userFactory");

describe("userFormatter utils", () => {

    const baseUser = createMockUserWithPassword({
        name: "John",
        avatar: "/uploads/avatars/avatar.png",
        password: "secret"
    });

    /* =============================
       AUTHENTICATED USER
    ============================= */

    describe("formatAuthenticatedUser", () => {

        it("should format authenticated user response", () => {
            const result = formatAuthenticatedUser(baseUser);

            expect(result).toEqual({
                userId: 1,
                name: "John",
                email: "john@test.com",
                avatar: "/uploads/avatars/avatar.png"
            });
        });

        it("should normalize missing avatar to null", () => {
            const result = formatAuthenticatedUser({
                ...baseUser,
                avatar: null
            });

            expect(result.avatar).toBeNull();
        });
    });

    /* =============================
       PUBLIC USER
    ============================= */

    describe("formatPublicUser", () => {

        it("should hide sensitive fields from public response", () => {
            const result = formatPublicUser(baseUser);

            expect(result).toEqual({
                name: "John",
                avatar: "/uploads/avatars/avatar.png"
            });

            expect(result.email).toBeUndefined();
            expect(result.password).toBeUndefined();
        });

        it("should normalize missing avatar to null", () => {
            const result = formatPublicUser({
                ...baseUser,
                avatar: undefined
            });

            expect(result.avatar).toBeNull();
        });
    });
});
