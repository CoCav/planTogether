/* =============================
   TEST MOCKS
============================= */

const loadCorsOptions = () => {
    jest.resetModules();
    return require("../../../src/config/cors");
};

/* ==========================================================================
   CORS Configuration Unit Tests

   Tests shared CORS configuration.

   Responsibilities
   - Test default allowed origin
   - Test configured allowed origins
   - Test requests without origin
   - Test rejected origins
   - Test credential support

   Notes
   - CORS_ORIGIN supports comma-separated origins.
=========================================================================== */

describe("cors config", () => {
    const originalCorsOrigin = process.env.CORS_ORIGIN;

    afterEach(() => {
        process.env.CORS_ORIGIN = originalCorsOrigin;
        jest.resetModules();
    });

    /* =============================
       ALLOWED ORIGINS
    ============================= */

    describe("Allowed origins", () => {
        it("allows the default Vite development origin", () => {
            delete process.env.CORS_ORIGIN;

            const corsOptions = loadCorsOptions();
            const callback = jest.fn();

            corsOptions.origin("http://localhost:5173", callback);

            expect(callback).toHaveBeenCalledWith(null, true);
        });

        it("allows configured comma-separated origins", () => {
            process.env.CORS_ORIGIN = "http://localhost:5173, https://example.com ";

            const corsOptions = loadCorsOptions();
            const callback = jest.fn();

            corsOptions.origin("https://example.com", callback);

            expect(callback).toHaveBeenCalledWith(null, true);
        });

        it("allows requests without an origin", () => {
            process.env.CORS_ORIGIN = "https://example.com";

            const corsOptions = loadCorsOptions();
            const callback = jest.fn();

            corsOptions.origin(undefined, callback);

            expect(callback).toHaveBeenCalledWith(null, true);
        });
    });

    /* =============================
       REJECTED ORIGINS
    ============================= */

    describe("Rejected origins", () => {
        it("rejects origins that are not configured", () => {
            process.env.CORS_ORIGIN = "https://allowed.com";

            const corsOptions = loadCorsOptions();
            const callback = jest.fn();

            corsOptions.origin("https://blocked.com", callback);

            expect(callback).toHaveBeenCalledWith(expect.any(Error));
            expect(callback.mock.calls[0][0].message).toBe("CORS origin not allowed");
        });
    });

    /* =============================
       CREDENTIALS
    ============================= */

    describe("Credentials", () => {
        it("enables credential support", () => {
            const corsOptions = loadCorsOptions();

            expect(corsOptions.credentials).toBe(true);
        });
    });
});
