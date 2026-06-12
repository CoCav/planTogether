/* ==================================================
   STRING FORMATTER TESTS

   Tests:
   - raw string normalization
   - email trimming and lowercase normalization
   - stable search key normalization
   - non-string value coercion
   - null/undefined normalization fallback

   Ensures:
   - reusable string normalization stays consistent
   - emails are normalized before persistence or lookup
   - search/cache keys stay stable across services
================================================== */

const {
    normalizeString,
    normalizeEmail,
    normalizeSearchKey
} = require("../../../../src/utils/formatting/stringFormatter");

describe("stringFormatter utils", () => {

    /* =============================
       STRING NORMALIZATION
    ============================= */

    describe("normalizeString", () => {

        it("should trim surrounding whitespace", () => {
            expect(normalizeString("  hello  ")).toBe("hello");
        });

        it("should coerce non-string values to string", () => {
            expect(normalizeString(123)).toBe("123");
        });

        it("should normalize null to empty string", () => {
            expect(normalizeString(null)).toBe("");
        });

        it("should normalize undefined to empty string", () => {
            expect(normalizeString(undefined)).toBe("");
        });
    });

    /* =============================
       EMAIL NORMALIZATION
    ============================= */

    describe("normalizeEmail", () => {

        it("should trim and lowercase email", () => {
            expect(normalizeEmail(" JOHN@TEST.COM ")).toBe("john@test.com");
        });

        it("should coerce email value to string", () => {
            expect(normalizeEmail(123)).toBe("123");
        });
    });

    /* =============================
       SEARCH KEY NORMALIZATION
    ============================= */

    describe("normalizeSearchKey", () => {

        it("should trim and lowercase search key", () => {
            expect(normalizeSearchKey("  Montreal  ")).toBe("montreal");
        });

        it("should normalize mixed case search key", () => {
            expect(normalizeSearchKey("MoNtReAl")).toBe("montreal");
        });

        it("should normalize null search key to empty string", () => {
            expect(normalizeSearchKey(null)).toBe("");
        });
    });
});
