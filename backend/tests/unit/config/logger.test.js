/* ==================================================
   LOGGER CONFIGURATION TESTS

   Tests:
   - default log level
   - custom log level
   - development pretty transport
   - production structured logging

   Ensures:
   - logger configuration stays environment-aware
   - LOG_LEVEL controls logger verbosity
   - production logs stay structured
================================================== */

jest.mock("pino", () => jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
})));

const loadLogger = () => {
    jest.resetModules();
    return require("../../../src/config/logger");
};

describe("logger config", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalLogLevel = process.env.LOG_LEVEL;

    afterEach(() => {
        process.env.NODE_ENV = originalNodeEnv;
        process.env.LOG_LEVEL = originalLogLevel;
        jest.clearAllMocks();
        jest.resetModules();
    });

    /* =============================
       LOG LEVEL
    ============================= */

    it("should use info as default log level", () => {
        delete process.env.LOG_LEVEL;
        process.env.NODE_ENV = "production";

        loadLogger();

        const pino = require("pino");

        expect(pino).toHaveBeenCalledWith(expect.objectContaining({
            level: "info"
        }));
    });

    it("should use LOG_LEVEL when provided", () => {
        process.env.LOG_LEVEL = "debug";
        process.env.NODE_ENV = "production";

        loadLogger();

        const pino = require("pino");

        expect(pino).toHaveBeenCalledWith(expect.objectContaining({
            level: "debug"
        }));
    });

    /* =============================
       DEVELOPMENT LOGGING
    ============================= */

    it("should use pino-pretty outside production", () => {
        process.env.NODE_ENV = "development";

        loadLogger();

        const pino = require("pino");

        expect(pino).toHaveBeenCalledWith(expect.objectContaining({
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:standard",
                    ignore: "pid,hostname"
                }
            }
        }));
    });

    /* =============================
       PRODUCTION LOGGING
    ============================= */

    it("should not use pino-pretty in production", () => {
        process.env.NODE_ENV = "production";

        loadLogger();

        const pino = require("pino");

        expect(pino).toHaveBeenCalledWith(expect.not.objectContaining({
            transport: expect.any(Object)
        }));
    });
});
