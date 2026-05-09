/* ==================================================
   NORMALIZATION UTILITY TESTS

   Tests:
   - email trimming
   - email lowercase normalization
   - non-string email coercion

   Ensures:
   - emails are normalized consistently before persistence or lookup
================================================== */

const { normalizeEmail } = require("../../../src/utils/normalize");

describe("normalize utils", () => {

    it("should trim and lowercase email", () => {
        expect(normalizeEmail(" JOHN@TEST.COM ")).toBe("john@test.com");
    });

    it("should coerce email value to string", () => {
        expect(normalizeEmail(123)).toBe("123");
    });
});
