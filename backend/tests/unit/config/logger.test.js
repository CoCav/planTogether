/* =============================
   TEST MOCKS
============================= */

jest.mock("pino", () =>
    jest.fn(() => ({
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn()
    }))
);

/* =============================
   TEST HELPERS
============================= */

const loadLogger = () => {
    jest.resetModules();

    const pino = require("pino");
    const logger = require("../../../src/config/logger");

    return {
        pino,
        logger
    };
};

/* ==========================================================================
   Logger Configuration Unit Tests

   Tests centralized logger configuration.

   Responsibilities
   - Test default log level
   - Test custom log level
   - Test development logging configuration
   - Test production logging configuration

   Notes
   - pino-pretty is enabled outside production.
=========================================================================== */

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
       LOG LEVEL CONFIGURATION
    ============================= */

    describe("Log level configuration", () => {
        it("uses info as the default log level", () => {
            delete process.env.LOG_LEVEL;
            process.env.NODE_ENV = "production";

            const { pino } = loadLogger();

            expect(pino).toHaveBeenCalledWith(
                expect.objectContaining({
                    level: "info"
                })
            );
        });

        it("uses LOG_LEVEL when provided", () => {
            process.env.LOG_LEVEL = "debug";
            process.env.NODE_ENV = "production";

            const { pino } = loadLogger();

            expect(pino).toHaveBeenCalledWith(
                expect.objectContaining({
                    level: "debug"
                })
            );
        });
    });

    /* =============================
       LOGGER CONFIGURATION
    ============================= */

    describe("Logger configuration", () => {
        it("uses pino-pretty outside production", () => {
            process.env.NODE_ENV = "development";

            const { pino } = loadLogger();

            expect(pino).toHaveBeenCalledWith(
                expect.objectContaining({
                    transport: {
                        target: "pino-pretty",
                        options: {
                            colorize: true,
                            translateTime: "SYS:standard",
                            ignore: "pid,hostname"
                        }
                    }
                })
            );
        });

        it("does not use pino-pretty in production", () => {
            process.env.NODE_ENV = "production";

            const { pino } = loadLogger();

            expect(pino).toHaveBeenCalledWith(
                expect.not.objectContaining({
                    transport: expect.any(Object)
                })
            );
        });
    });
});
