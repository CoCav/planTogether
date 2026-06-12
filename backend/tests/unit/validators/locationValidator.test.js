/* ==================================================
   LOCATION VALIDATOR TESTS

   Tests:
   - valid location search query
   - missing location query
   - empty location query
   - too short location query
   - too long location query

   Ensures:
   - invalid location search queries are rejected early
   - location search input stays normalized and constrained
================================================== */

const { searchLocationValidator } = require("../../../src/validators/locationValidator");

const { runValidation } = require("../../helpers/validation/validationHelper");

describe("locationValidator", () => {

    /* =============================
       LOCATION SEARCH VALIDATION
    ============================= */

    describe("searchLocationValidator", () => {

        it("should pass with a valid location query", async () => {
            const result = await runValidation(searchLocationValidator, {
                query: {
                    q: "Montreal"
                }
            });

            expect(result.isEmpty()).toBe(true);
        });

        it("should fail when location query is missing", async () => {
            const result = await runValidation(searchLocationValidator, {
                query: {}
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Location query is required"
                    })
                ])
            );
        });

        it("should fail when location query is empty", async () => {
            const result = await runValidation(searchLocationValidator, {
                query: {
                    q: ""
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Location query is required"
                    })
                ])
            );
        });

        it("should fail when location query is too short", async () => {
            const result = await runValidation(searchLocationValidator, {
                query: {
                    q: "a"
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Location query must be between 2 and 200 characters"
                    })
                ])
            );
        });

        it("should fail when location query is too long", async () => {
            const result = await runValidation(searchLocationValidator, {
                query: {
                    q: "a".repeat(201)
                }
            });

            expect(result.array()).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        msg: "Location query must be between 2 and 200 characters"
                    })
                ])
            );
        });
    });
});
