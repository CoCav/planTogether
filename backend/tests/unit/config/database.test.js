const mockSequelize = jest.fn();

const loadDatabaseConfig = () => {
    jest.resetModules();
    return require("../../../src/config/database");
};

/* ==========================================================================
   Database Configuration Unit Tests

   Tests Sequelize database configuration.

   Responsibilities
   - Test environment-based database selection
   - Test PostgreSQL connection options
   - Test default and custom ports
   - Test SSL configuration
   - Test environment-aware database logging

   Notes
   - Test environment uses DB_NAME_TEST.
   - Other environments use DB_NAME.
   - SQL logging must remain disabled.
=========================================================================== */

/* =============================
   TEST MOCKS
============================= */

jest.mock("sequelize", () => ({
    Sequelize: jest.fn((...args) => {
        mockSequelize(...args);

        return {
            authenticate: jest.fn(),
            sync: jest.fn()
        };
    })
}));

jest.mock("../../../src/config/logger", () => ({
    info: jest.fn(),
    debug: jest.fn()
}));

describe("database config", () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        jest.clearAllMocks();

        process.env.DB_USER = "postgres";
        process.env.DB_PASSWORD = "password";
        process.env.DB_HOST = "localhost";

        delete process.env.DB_PORT;
        delete process.env.DB_SSL;
        delete process.env.DB_NAME;
        delete process.env.DB_NAME_TEST;
    });

    afterEach(() => {
        process.env = { ...originalEnv };
        jest.resetModules();
    });

    /* =============================
       DATABASE SELECTION
    ============================= */

    describe("Database selection", () => {
        it("uses DB_NAME outside the test environment", () => {
            process.env.NODE_ENV = "development";
            process.env.DB_NAME = "main_db";

            loadDatabaseConfig();

            expect(mockSequelize).toHaveBeenCalledWith(
                "main_db",
                "postgres",
                "password",
                expect.any(Object)
            );
        });

        it("uses DB_NAME_TEST in the test environment", () => {
            process.env.NODE_ENV = "test";
            process.env.DB_NAME_TEST = "test_db";

            loadDatabaseConfig();

            expect(mockSequelize).toHaveBeenCalledWith(
                "test_db",
                "postgres",
                "password",
                expect.any(Object)
            );
        });
    });

    /* =============================
       CONNECTION OPTIONS
    ============================= */

    describe("Connection options", () => {
        it("configures PostgreSQL with the expected host and disabled SQL logging", () => {
            process.env.NODE_ENV = "development";
            process.env.DB_NAME = "main_db";

            loadDatabaseConfig();

            expect(mockSequelize).toHaveBeenCalledWith(
                "main_db",
                "postgres",
                "password",
                expect.objectContaining({
                    host: "localhost",
                    dialect: "postgres",
                    logging: false
                })
            );
        });
    });

    /* =============================
       PORT CONFIGURATION
    ============================= */

    describe("Port configuration", () => {
        it("uses the default PostgreSQL port", () => {
            process.env.NODE_ENV = "development";
            process.env.DB_NAME = "main_db";

            loadDatabaseConfig();

            expect(mockSequelize).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                expect.any(String),
                expect.objectContaining({
                    port: 5432
                })
            );
        });

        it("uses DB_PORT when provided", () => {
            process.env.NODE_ENV = "development";
            process.env.DB_NAME = "main_db";
            process.env.DB_PORT = "5433";

            loadDatabaseConfig();

            expect(mockSequelize).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                expect.any(String),
                expect.objectContaining({
                    port: 5433
                })
            );
        });
    });

    /* =============================
       SSL CONFIGURATION
    ============================= */

    describe("SSL configuration", () => {
        it("enables SSL when DB_SSL=true", () => {
            process.env.NODE_ENV = "production";
            process.env.DB_NAME = "main_db";
            process.env.DB_SSL = "true";

            loadDatabaseConfig();

            expect(mockSequelize).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                expect.any(String),
                expect.objectContaining({
                    dialectOptions: {
                        ssl: {
                            require: true,
                            rejectUnauthorized: false
                        }
                    }
                })
            );
        });

        it("does not configure SSL when DB_SSL is disabled", () => {
            process.env.NODE_ENV = "development";
            process.env.DB_NAME = "main_db";
            process.env.DB_SSL = "false";

            loadDatabaseConfig();

            expect(mockSequelize).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                expect.any(String),
                expect.not.objectContaining({
                    dialectOptions: expect.any(Object)
                })
            );
        });
    });

    /* =============================
       DATABASE LOGGING
    ============================= */

    describe("Database logging", () => {
        it("logs the development database outside production", () => {
            process.env.NODE_ENV = "development";
            process.env.DB_NAME = "main_db";

            loadDatabaseConfig();

            const logger = require("../../../src/config/logger");

            expect(logger.info).toHaveBeenCalledWith("Connecting to development database: main_db");
        });

        it("logs the test database in the test environment", () => {
            process.env.NODE_ENV = "test";
            process.env.DB_NAME_TEST = "test_db";

            loadDatabaseConfig();

            const logger = require("../../../src/config/logger");

            expect(logger.info).toHaveBeenCalledWith("Connecting to test database: test_db");
        });

        it("does not log the target database in production", () => {
            process.env.NODE_ENV = "production";
            process.env.DB_NAME = "main_db";

            loadDatabaseConfig();

            const logger = require("../../../src/config/logger");

            expect(logger.info).not.toHaveBeenCalled();
        });
    });
});
