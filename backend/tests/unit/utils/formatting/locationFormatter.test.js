/* ==================================================
   LOCATION FORMATTER UTILITIES TESTS

   Tests:
   - Nominatim search params formatting
   - provider location formatting
   - provider coordinate conversion
   - provider fallback label
   - fallback search query generation
   - postal code removal
   - duplicate fallback query cleanup
   - invalid provider coordinate handling

   Ensures:
   - Nominatim requests use expected query params
   - provider results are converted into internal location data
   - fallback queries make detailed addresses more resilient
   - invalid provider coordinates are rejected early
================================================== */

jest.mock("../../../../src/config/location", () => ({
    provider: "nominatim",
    nominatim: {
        resultLimit: 5
    }
}));

const {
    LOCATION_PROVIDER,
    buildNominatimSearchParams,
    buildLocationSearchQueries,
    pickAddressValue,
    buildStreetAddress,
    formatProviderAddress,
    formatProviderLocation
} = require("../../../../src/utils/formatting/locationFormatter");

describe("locationFormatter utils", () => {

    /* =============================
       PROVIDER CONFIG
    ============================= */

    it("should expose configured location provider", () => {
        expect(LOCATION_PROVIDER).toBe("nominatim");
    });

    /* =============================
       NOMINATIM PARAMS
    ============================= */

    it("should build Nominatim search params", () => {
        const params = buildNominatimSearchParams("Montreal");

        expect(params.toString()).toBe("q=Montreal&format=json&addressdetails=1&limit=5");
    });

    /* =============================
       SEARCH FALLBACKS
    ============================= */

    it("should build fallback search queries from a detailed address", () => {
        const result = buildLocationSearchQueries("179 Grande Allée O, Québec, QC G1R 2H1, Canada");

        expect(result).toEqual([
            "179 Grande Allée O, Québec, QC G1R 2H1, Canada",
            "179 Grande Allée O, Québec, QC, Canada",
            "Québec, QC, Canada"
        ]);
    });

    it("should remove Canadian postal code from fallback query", () => {
        const result = buildLocationSearchQueries("179 Grande Allée O, Québec, QC G1R 2H1, Canada");

        expect(result).toContain("179 Grande Allée O, Québec, QC, Canada");
    });

    it("should remove duplicate fallback queries", () => {
        const result = buildLocationSearchQueries("Montreal");

        expect(result).toEqual(["Montreal"]);
    });

    it("should return empty array for empty query", () => {
        const result = buildLocationSearchQueries("");

        expect(result).toEqual([]);
    });

    /* =============================
       STRUCTURED ADDRESS FORMAT
    ============================= */

    it("should pick first available address value", () => {
        expect(
            pickAddressValue({
                town: "Québec",
                city: "Montréal"
            }, ["city", "town"])
        ).toBe("Montréal");
    });

    it("should build street address with house number", () => {
        expect(
            buildStreetAddress({
                house_number: "123",
                road: "Rue Sainte-Catherine"
            })
        ).toBe("123 Rue Sainte-Catherine");
    });

    it("should build street address without house number", () => {
        expect(
            buildStreetAddress({
                road: "Rue Sainte-Catherine"
            })
        ).toBe("Rue Sainte-Catherine");
    });

    it("should return null street address when road is missing", () => {
        expect(buildStreetAddress({})).toBeNull();
    });

    it("should format structured provider address", () => {
        const result = formatProviderAddress({
            house_number: "123",
            road: "Rue Sainte-Catherine",
            city: "Montréal",
            state: "Québec",
            postcode: "H2X 1Y4",
            country: "Canada"
        });

        expect(result).toEqual({
            streetAddress: "123 Rue Sainte-Catherine",
            city: "Montréal",
            region: "Québec",
            postalCode: "H2X 1Y4",
            country: "Canada"
        });
    });

    /* =============================
       PROVIDER LOCATION FORMAT
    ============================= */

    it("should format provider location result", () => {
        const result = formatProviderLocation("Montreal", {
            lat: "45.5031824",
            lon: "-73.5698065",
            display_name: "Montréal, Québec, Canada",
            address: {
                city: "Montréal",
                state: "Québec",
                postcode: "H2X 1Y4",
                country: "Canada"
            }
        });

        expect(result).toEqual({
            query: "montreal",
            label: "Montréal, Québec, Canada",
            streetAddress: null,
            city: "Montréal",
            region: "Québec",
            postalCode: "H2X 1Y4",
            country: "Canada",
            latitude: 45.5031824,
            longitude: -73.5698065,
            provider: "nominatim"
        });
    });

    it("should normalize query before storing it", () => {
        const result = formatProviderLocation("   Montreal   ", {
            lat: "45.5031824",
            lon: "-73.5698065",
            display_name: "Montréal, Québec, Canada"
        });

        expect(result.query).toBe("montreal");
    });

    it("should use query as fallback label when display name is missing", () => {
        const result = formatProviderLocation("Montreal", {
            lat: "45.5031824",
            lon: "-73.5698065"
        });

        expect(result.label).toBe("Montreal");
    });

    it("should throw when provider latitude is invalid", () => {
        expect(() =>
            formatProviderLocation("Montreal", {
                lat: "invalid",
                lon: "-73.5698065",
                display_name: "Montréal, Québec, Canada"
            })
        ).toThrow("Invalid location provider response");
    });

    it("should throw when provider longitude is invalid", () => {
        expect(() =>
            formatProviderLocation("Montreal", {
                lat: "45.5031824",
                lon: "invalid",
                display_name: "Montréal, Québec, Canada"
            })
        ).toThrow("Invalid location provider response");
    });
});
