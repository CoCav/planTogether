const {
    normalizeString,
    normalizeEmail,
    normalizeSearchKey
} = require("../../../src/utils/stringNormalizer");

/* ==========================================================================
   String Normalizer Utility Unit Tests

   Tests shared string normalization helpers.

   Responsibilities
   - Test raw string normalization
   - Test nullish value handling
   - Test email normalization
   - Test search key normalization

   Notes
   - Normalization converts values to strings before trimming.
   - Email and search keys are normalized to lowercase.
=========================================================================== */

describe("string normalizer utility", () => {

    /* =============================
       STRING NORMALIZATION
    ============================= */

    describe("normalizeString", () => {
        it("trims surrounding whitespace", () => {
            expect(normalizeString("  Test value  ")).toBe("Test value");
        });

        it.each([
            ["null", null],
            ["undefined", undefined]
        ])("normalizes %s to an empty string", (_, value) => {
            expect(normalizeString(value)).toBe("");
        });

        it.each([
            ["number", 42, "42"],
            ["boolean", true, "true"]
        ])("converts a %s value to a trimmed string", (_, value, expected) => {
            expect(normalizeString(value)).toBe(expected);
        });

        it("preserves an already normalized string", () => {
            expect(normalizeString("Montreal")).toBe("Montreal");
        });
    });

    /* =============================
       EMAIL NORMALIZATION
    ============================= */

    describe("normalizeEmail", () => {
        it("trims and lowercases an email address", () => {
            expect(normalizeEmail("  USER@EXAMPLE.COM  ")).toBe("user@example.com");
        });

        it("normalizes a missing email to an empty string", () => {
            expect(normalizeEmail(undefined)).toBe("");
        });
    });

    /* =============================
       SEARCH KEY NORMALIZATION
    ============================= */

    describe("normalizeSearchKey", () => {
        it("trims and lowercases a search key", () => {
            expect(normalizeSearchKey("  Montréal  ")).toBe("montréal");
        });

        it("normalizes a missing search key to an empty string", () => {
            expect(normalizeSearchKey(null)).toBe("");
        });
    });
});
