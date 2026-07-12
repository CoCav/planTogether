const { formatPublicUser } = require("../../../../../src/utils/users/public/publicUserFormatter");

/* ==========================================================================
   Public User Formatter Unit Tests

   Tests public user response formatting.

   Responsibilities
   - Test public user field mapping
   - Test avatar normalization
   - Test sensitive field exclusion

   Notes
   - Public user responses never expose private account information.
   - Missing avatars are normalized to null.
=========================================================================== */

describe("public user formatter", () => {

    /* =============================
       PUBLIC USER FORMAT
    ============================= */

    describe("formatPublicUser", () => {
        it("formats a public user response", () => {
            const result = formatPublicUser({
                name: "Jane Doe",
                avatar: "/uploads/avatars/jane.png"
            });

            expect(result).toEqual({
                name: "Jane Doe",
                avatar: "/uploads/avatars/jane.png"
            });
        });

        it.each([
            ["null", null],
            ["undefined", undefined],
            ["empty string", ""]
        ])("normalizes a %s avatar to null", (_, avatar) => {
            const result = formatPublicUser({
                name: "Jane Doe",
                avatar
            });

            expect(result.avatar).toBeNull();
        });

        it("returns only public user response fields", () => {
            const result = formatPublicUser({
                id: 10,
                name: "Jane Doe",
                email: "jane@example.com",
                avatar: null,
                password: "hashed-password",
                createdAt: "2026-01-01T00:00:00.000Z",
                updatedAt: "2026-01-02T00:00:00.000Z"
            });

            expect(result).toEqual({
                name: "Jane Doe",
                avatar: null
            });
        });

        it("does not expose sensitive user fields", () => {
            const result = formatPublicUser({
                id: 10,
                name: "Jane Doe",
                email: "jane@example.com",
                avatar: null,
                password: "hashed-password"
            });

            expect(result).not.toHaveProperty("id");
            expect(result).not.toHaveProperty("email");
            expect(result).not.toHaveProperty("password");
        });
    });
});
