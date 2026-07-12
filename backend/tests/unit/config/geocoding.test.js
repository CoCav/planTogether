const loadGeocodingConfig = () => {
    jest.resetModules();
    return require("../../../src/config/geocoding");
};

/* ==========================================================================
   Geocoding Configuration Unit Tests

   Tests geocoding provider configuration.

   Responsibilities
   - Test default provider configuration
   - Test provider environment overrides
   - Test Nominatim endpoint configuration
   - Test user agent configuration
   - Test result limit configuration

   Notes
   - Environment variables override default values.
=========================================================================== */

describe("geocoding config", () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
        process.env = { ...originalEnv };
        jest.resetModules();
    });

    /* =============================
       DEFAULT CONFIGURATION
    ============================= */

    describe("Default configuration", () => {
        it("uses the default geocoding provider", () => {
            delete process.env.GEOCODING_PROVIDER;

            const config = loadGeocodingConfig();

            expect(config.provider).toBe("nominatim");
        });

        it("uses the default Nominatim search URL", () => {
            delete process.env.NOMINATIM_SEARCH_URL;

            const config = loadGeocodingConfig();

            expect(config.nominatim.searchUrl).toBe("https://nominatim.openstreetmap.org/search");
        });

        it("uses the default user agent", () => {
            delete process.env.GEOCODING_USER_AGENT;

            const config = loadGeocodingConfig();

            expect(config.nominatim.userAgent).toBe("PlanTogether/1.0");
        });

        it("uses the default result limit", () => {
            delete process.env.GEOCODING_RESULT_LIMIT;

            const config = loadGeocodingConfig();

            expect(config.nominatim.resultLimit).toBe(5);
        });
    });

    /* =============================
       ENVIRONMENT OVERRIDES
    ============================= */

    describe("Environment overrides", () => {
        it("uses a custom geocoding provider", () => {
            process.env.GEOCODING_PROVIDER = "custom-provider";

            const config = loadGeocodingConfig();

            expect(config.provider).toBe("custom-provider");
        });

        it("uses a custom search URL", () => {
            process.env.NOMINATIM_SEARCH_URL =
                "https://example.com/search";

            const config = loadGeocodingConfig();

            expect(config.nominatim.searchUrl).toBe("https://example.com/search");
        });

        it("uses a custom user agent", () => {
            process.env.GEOCODING_USER_AGENT =
                "MyApp/2.0";

            const config = loadGeocodingConfig();

            expect(config.nominatim.userAgent).toBe("MyApp/2.0");
        });

        it("converts the configured result limit to a number", () => {
            process.env.GEOCODING_RESULT_LIMIT = "10";

            const config = loadGeocodingConfig();

            expect(config.nominatim.resultLimit).toBe(10);
        });
    });
});
