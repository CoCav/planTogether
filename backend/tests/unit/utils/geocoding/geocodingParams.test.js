const geocodingConfig = require("../../../../src/config/geocoding");

const { buildNominatimSearchParams } = require("../../../../src/utils/geocoding/geocodingParams");

/* ==========================================================================
   Geocoding Params Utility Unit Tests

   Tests Nominatim search parameter building.

   Responsibilities
   - Test search query forwarding
   - Test response format configuration
   - Test address detail configuration
   - Test configured result limits

   Notes
   - Nominatim query parameters are returned as URLSearchParams.
=========================================================================== */

describe("geocoding params utility", () => {

    /* =============================
       NOMINATIM SEARCH PARAMS
    ============================= */

    describe("buildNominatimSearchParams", () => {
        it("builds the expected Nominatim search parameters", () => {
            const params = buildNominatimSearchParams("Montreal");

            expect(params).toBeInstanceOf(URLSearchParams);

            expect(Object.fromEntries(params.entries())).toEqual({
                q: "Montreal",
                format: "json",
                addressdetails: "1",
                limit: String(geocodingConfig.nominatim.resultLimit)
            });
        });

        it("forwards the provided search query unchanged", () => {
            const params = buildNominatimSearchParams("1500 Rue Sainte-Catherine O, Montréal");

            expect(params.get("q")).toBe("1500 Rue Sainte-Catherine O, Montréal");
        });

        it("serializes the configured result limit as a string", () => {
            const params = buildNominatimSearchParams("Quebec City");

            expect(params.get("limit")).toBe(
                String(geocodingConfig.nominatim.resultLimit)
            );
        });
    });
});
