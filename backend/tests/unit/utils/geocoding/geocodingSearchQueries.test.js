const {
    removePostalCode,
    buildLocationSearchQueries
} = require("../../../../src/utils/geocoding/geocodingSearchQueries");

/* ==========================================================================
   Geocoding Search Query Utility Unit Tests

   Tests geocoding search query helpers.

   Responsibilities
   - Test postal code removal
   - Test search query normalization
   - Test fallback search query generation
   - Test duplicate query removal

   Notes
   - Fallback queries broaden overly specific addresses.
=========================================================================== */

describe("geocoding search query utility", () => {

    /* =============================
       POSTAL CODE REMOVAL
    ============================= */

    describe("removePostalCode", () => {
        it("removes Canadian postal codes", () => {
            expect(removePostalCode("123 Main St, Montréal H2X 1Y4")).toBe("123 Main St, Montréal");
        });

        it("normalizes spacing after postal code removal", () => {
            expect(removePostalCode("123 Main St,   Montréal, H2X 1Y4")).toBe("123 Main St, Montréal");
        });

        it("returns an already normalized address unchanged", () => {
            expect(removePostalCode("Montréal")).toBe("Montréal");
        });
    });

    /* =============================
       SEARCH QUERY BUILDING
    ============================= */

    describe("buildLocationSearchQueries", () => {
        it("returns progressively broader search queries", () => {
            expect(buildLocationSearchQueries("123 Main St, Montréal, Québec, Canada H2X 1Y4")).toEqual([
                "123 Main St, Montréal, Québec, Canada H2X 1Y4",
                "123 Main St, Montréal, Québec, Canada",
                "Montréal, Québec, Canada"
            ]);
        });

        it("removes duplicate queries", () => {
            expect(buildLocationSearchQueries("Montréal")).toEqual([
                "Montréal"
            ]);
        });

        it("returns an empty array for blank input", () => {
            expect(buildLocationSearchQueries("   ")).toEqual([]);
        });

        it("returns an empty array for nullish input", () => {
            expect(buildLocationSearchQueries(null)).toEqual([]);
            expect(buildLocationSearchQueries(undefined)).toEqual([]);
        });

        it("returns only available fallback levels", () => {
            expect(buildLocationSearchQueries("Montréal, Québec")).toEqual([
                "Montréal, Québec"
            ]);
        });
    });
});
