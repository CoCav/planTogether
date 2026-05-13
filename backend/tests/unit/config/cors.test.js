/* ==================================================
   CORS CONFIGURATION TESTS

   Tests:
   - default allowed origin
   - comma-separated allowed origins
   - requests without origin
   - rejected origins
   - credentials support

   Ensures:
   - CORS configuration stays consistent
   - frontend origins are controlled through environment variables
   - non-browser requests remain supported
================================================== */

const loadCorsOptions = () => {
    jest.resetModules();
    return require("../../../src/config/cors");
};

describe("cors config", () => {

    const originalCorsOrigin = process.env.CORS_ORIGIN;

    afterEach(() => {
        process.env.CORS_ORIGIN = originalCorsOrigin;
        jest.resetModules();
    });

    /* =============================
       ALLOWED ORIGINS
    ============================= */

    it("should allow default Vite dev server origin", () => {
        delete process.env.CORS_ORIGIN;

        const corsOptions = loadCorsOptions();
        const callback = jest.fn();

        corsOptions.origin("http://localhost:5173", callback);

        expect(callback).toHaveBeenCalledWith(null, true);
    });

    it("should allow comma-separated configured origins", () => {
        process.env.CORS_ORIGIN = "http://localhost:5173,https://example.com";

        const corsOptions = loadCorsOptions();
        const callback = jest.fn();

        corsOptions.origin("https://example.com", callback);

        expect(callback).toHaveBeenCalledWith(null, true);
    });

    it("should allow requests without origin", () => {
        process.env.CORS_ORIGIN = "https://example.com";

        const corsOptions = loadCorsOptions();
        const callback = jest.fn();

        corsOptions.origin(undefined, callback);

        expect(callback).toHaveBeenCalledWith(null, true);
    });

    /* =============================
       REJECTED ORIGINS
    ============================= */

    it("should reject origins that are not allowed", () => {
        process.env.CORS_ORIGIN = "https://allowed.com";

        const corsOptions = loadCorsOptions();
        const callback = jest.fn();

        corsOptions.origin("https://blocked.com", callback);

        expect(callback).toHaveBeenCalledWith(expect.any(Error));
        expect(callback.mock.calls[0][0].message).toBe("CORS origin not allowed");
    });

    /* =============================
       CREDENTIALS
    ============================= */

    it("should enable credentials", () => {
        const corsOptions = loadCorsOptions();

        expect(corsOptions.credentials).toBe(true);
    });
});
