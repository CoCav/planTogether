/* ==================================================
   LOCATION CONFIGURATION TESTS

   Tests:
   - default location provider
   - configured location provider
   - default Nominatim search URL
   - configured Nominatim search URL
   - default geocoding user agent
   - configured geocoding user agent
   - default result limit
   - configured result limit

   Ensures:
   - location provider config stays environment-driven
   - Nominatim config has safe defaults for development
================================================== */

const loadLocationConfig = () => {
    jest.resetModules();
    return require("../../../src/config/geocoding");
};

describe("geocoding config", () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
        process.env = { ...originalEnv };
        jest.resetModules();
    });

    /* =============================
       PROVIDER
    ============================= */

    it("should use nominatim as default provider", () => {
        delete process.env.LOCATION_PROVIDER;

        const geocodingConfig = loadLocationConfig();

        expect(geocodingConfig.provider).toBe("nominatim");
    });

    it("should use configured location provider", () => {
        process.env.LOCATION_PROVIDER = "mapbox";

        const geocodingConfig = loadLocationConfig();

        expect(geocodingConfig.provider).toBe("mapbox");
    });

    /* =============================
       NOMINATIM SEARCH URL
    ============================= */

    it("should use default Nominatim search URL", () => {
        delete process.env.NOMINATIM_SEARCH_URL;

        const geocodingConfig = loadLocationConfig();

        expect(geocodingConfig.nominatim.searchUrl).toBe(
            "https://nominatim.openstreetmap.org/search"
        );
    });

    it("should use configured Nominatim search URL", () => {
        process.env.NOMINATIM_SEARCH_URL = "https://example.com/search";

        const geocodingConfig = loadLocationConfig();

        expect(geocodingConfig.nominatim.searchUrl).toBe("https://example.com/search");
    });

    /* =============================
       USER AGENT
    ============================= */

    it("should use default geocoding user agent", () => {
        delete process.env.GEOCODING_USER_AGENT;

        const geocodingConfig = loadLocationConfig();

        expect(geocodingConfig.nominatim.userAgent).toBe("PlanTogether/1.0");
    });

    it("should use configured geocoding user agent", () => {
        process.env.GEOCODING_USER_AGENT = "PlanTogetherTest/1.0";

        const geocodingConfig = loadLocationConfig();

        expect(geocodingConfig.nominatim.userAgent).toBe("PlanTogetherTest/1.0");
    });

    /* =============================
       RESULT LIMIT
    ============================= */

    it("should use default geocoding result limit", () => {
        delete process.env.GEOCODING_RESULT_LIMIT;

        const geocodingConfig = loadLocationConfig();

        expect(geocodingConfig.nominatim.resultLimit).toBe(5);
    });

    it("should use configured geocoding result limit", () => {
        process.env.GEOCODING_RESULT_LIMIT = "8";

        const geocodingConfig = loadLocationConfig();

        expect(geocodingConfig.nominatim.resultLimit).toBe(8);
    });
});
