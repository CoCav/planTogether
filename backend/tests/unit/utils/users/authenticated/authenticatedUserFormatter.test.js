const { formatAuthenticatedUser } = require("../../../../../src/utils/users/authenticated/authenticatedUserFormatter");

/* ==========================================================================
   Authenticated User Formatter Unit Tests

   Tests authenticated user response formatting.

   Responsibilities
   - Test authenticated user field mapping
   - Test user ID renaming
   - Test email exposure
   - Test avatar normalization

   Notes
   - Authenticated users can access their own email address.
   - Missing avatars are normalized to null.
=========================================================================== */

describe("authenticated user formatter", () => {

    /* =============================
       AUTHENTICATED USER FORMAT
    ============================= */

    describe("formatAuthenticatedUser", () => {
        it("formats an authenticated user response", () => {
            const result = formatAuthenticatedUser({
                id: 10,
                name: "Jane Doe",
                email: "jane@example.com",
                avatar: "/uploads/avatars/jane.png"
            });

            expect(result).toEqual({
                userId: 10,
                name: "Jane Doe",
                email: "jane@example.com",
                avatar: "/uploads/avatars/jane.png"
            });
        });

        it("renames id to userId", () => {
            const result = formatAuthenticatedUser({
                id: 42,
                name: "Jane Doe",
                email: "jane@example.com",
                avatar: null
            });

            expect(result.userId).toBe(42);
            expect(result).not.toHaveProperty("id");
        });

        it.each([
            ["null", null],
            ["undefined", undefined],
            ["empty string", ""]
        ])("normalizes a %s avatar to null", (_, avatar) => {
            const result = formatAuthenticatedUser({
                id: 10,
                name: "Jane Doe",
                email: "jane@example.com",
                avatar
            });

            expect(result.avatar).toBeNull();
        });

        it("returns only authenticated user response fields", () => {
            const result = formatAuthenticatedUser({
                id: 10,
                name: "Jane Doe",
                email: "jane@example.com",
                avatar: null,
                password: "hashed-password",
                createdAt: "2026-01-01T00:00:00.000Z"
            });

            expect(result).toEqual({
                userId: 10,
                name: "Jane Doe",
                email: "jane@example.com",
                avatar: null
            });
        });
    });
});
