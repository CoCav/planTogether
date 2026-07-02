/* ==================================================
   DATABASE CONFIGURATION TESTS

   Tests:
   - development database selection
   - test database selection
   - disabled Sequelize SQL logging
   - SSL configuration
   - default PostgreSQL port

   Ensures:
   - Sequelize receives the correct configuration
   - environment-based database behavior stays consistent
================================================== */

const mockSequelize = jest.fn();

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

const loadDatabaseConfig = () => {
    jest.resetModules();
    return require("../../../src/config/database");
};

describe("database config", () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        jest.clearAllMocks();

        process.env.DB_USER = "postgres";
        process.env.DB_PASSWORD = "password";
        process.env.DB_HOST = "localhost";
    });

    afterEach(() => {
        process.env = { ...originalEnv };
        jest.resetModules();
    });

    /* =============================
       DATABASE SELECTION
    ============================= */

    it("should use DB_NAME in development", () => {
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

    it("should use DB_NAME_TEST in test environment", () => {
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

    /* =============================
       PORT CONFIGURATION
    ============================= */

    it("should use default PostgreSQL port", () => {
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

    it("should use custom DB_PORT when provided", () => {
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

    /* =============================
       SEQUELIZE LOGGING
    ============================= */

    it("should disable SQL logging", () => {
        process.env.NODE_ENV = "development";
        process.env.DB_NAME = "main_db";

        loadDatabaseConfig();

        expect(mockSequelize).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(String),
            expect.any(String),
            expect.objectContaining({
                logging: false
            })
        );
    });

    /* =============================
       SSL CONFIGURATION
    ============================= */

    it("should enable SSL when DB_SSL=true", () => {
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

    /* =============================
       DATABASE LOGGING
    ============================= */

    it("should log target database outside production", () => {
        process.env.NODE_ENV = "development";
        process.env.DB_NAME = "main_db";

        loadDatabaseConfig();

        const logger = require("../../../src/config/logger");

        expect(logger.info).toHaveBeenCalledWith("Connecting to development database: main_db");
    });

    it("should not log target database in production", () => {
        process.env.NODE_ENV = "production";
        process.env.DB_NAME = "main_db";

        loadDatabaseConfig();

        const logger = require("../../../src/config/logger");

        expect(logger.info).not.toHaveBeenCalled();
    });
});
