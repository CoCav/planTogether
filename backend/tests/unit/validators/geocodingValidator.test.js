const { searchLocationsValidator } = require("../../../src/validators/geocodingValidator");

const {
    runValidation,
    getValidationMessages
} = require("../../helpers/validation/validationTestHelper");

/* ==========================================================================
   Geocoding Validator Unit Tests

   Tests geocoding search query validation.

   Responsibilities
   - Test required location queries
   - Test location query length limits
   - Test location query sanitization
   - Test valid location searches

   Notes
   - Search queries must contain between 2 and 200 characters.
=========================================================================== */

describe("geocoding validator", () => {

    /* =============================
       VALID LOCATION QUERY
    ============================= */

    describe("Valid location query", () => {
        it("accepts a valid location query", async () => {
            const { errors } = await runValidation(
                searchLocationsValidator,
                {
                    query: {
                        q: "Montreal"
                    }
                }
            );

            expect(errors).toHaveLength(0);
        });

        it("trims the location query", async () => {
            const { errors, req } = await runValidation(
                searchLocationsValidator,
                {
                    query: {
                        q: "  Montreal  "
                    }
                }
            );

            expect(errors).toHaveLength(0);
            expect(req.query.q).toBe("Montreal");
        });

        it.each([
            ["minimum length", "AB"],
            ["maximum length", "A".repeat(200)]
        ])("accepts a query at the %s boundary", async (_, q) => {
            const { errors } = await runValidation(
                searchLocationsValidator,
                {
                    query: {
                        q
                    }
                }
            );

            expect(errors).toHaveLength(0);
        });
    });

    /* =============================
       REQUIRED QUERY
    ============================= */

    describe("Required query", () => {
        it.each([
            ["missing", undefined],
            ["empty", ""],
            ["whitespace-only", "   "]
        ])("rejects a %s location query", async (_, q) => {
            const query = {};

            if (q !== undefined) {
                query.q = q;
            }

            const { errors } = await runValidation(
                searchLocationsValidator,
                { query }
            );

            expect(getValidationMessages(errors)).toContain("Location query is required");
        });
    });

    /* =============================
       QUERY LENGTH
    ============================= */

    describe("Query length", () => {
        it("rejects a location query shorter than 2 characters", async () => {
            const { errors } = await runValidation(
                searchLocationsValidator,
                {
                    query: {
                        q: "A"
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain(
                "Location query must be between 2 and 200 characters"
            );
        });

        it("rejects a location query longer than 200 characters", async () => {
            const { errors } = await runValidation(
                searchLocationsValidator,
                {
                    query: {
                        q: "A".repeat(201)
                    }
                }
            );

            expect(getValidationMessages(errors)).toContain("Location query must be between 2 and 200 characters");
        });
    });
});
