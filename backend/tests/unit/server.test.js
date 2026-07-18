/* =============================
   MOCK FUNCTIONS
============================= */

const mockListen = jest.fn((port, callback) => {
    callback();

    return {
        close: jest.fn()
    };
});

const mockInitDB = jest.fn();
const mockLoggerInfo = jest.fn();
const mockLoggerError = jest.fn();

/* =============================
   TEST MOCKS
============================= */

jest.mock("../../src/app", () => ({
    listen: mockListen
}));

jest.mock("../../src/models", () => ({
    initDB: mockInitDB
}));

jest.mock("../../src/config/logger", () => ({
    info: mockLoggerInfo,
    error: mockLoggerError
}));

/* =============================
   TEST IMPORTS
============================= */

const { startServer } = require("../../src/server");

/* ==========================================================================
   Server Unit Tests

   Tests application startup.

   Responsibilities
   - Test successful server startup
   - Test default port usage
   - Test custom port usage
   - Test startup failure handling

   Notes
   - Database initialization is mocked.
   - Express listen is mocked.
   - The server is never actually started.
=========================================================================== */

describe("server", () => {
    const ORIGINAL_PORT = process.env.PORT;

    beforeEach(() => {
        jest.clearAllMocks();

        delete process.env.PORT;
    });

    afterAll(() => {
        process.env.PORT = ORIGINAL_PORT;
    });

    /* =============================
       SERVER STARTUP
    ============================= */

    describe("startServer", () => {

        it("starts the server using the default port", async () => {
            mockInitDB.mockResolvedValue();

            await startServer();

            expect(mockInitDB).toHaveBeenCalledTimes(1);
            expect(mockListen).toHaveBeenCalledWith(3000, expect.any(Function));

            expect(mockLoggerInfo).toHaveBeenCalledWith("Server listening on http://localhost:3000");
        });

        it("starts the server using the configured port", async () => {
            process.env.PORT = "8080";

            mockInitDB.mockResolvedValue();

            await startServer();

            expect(mockListen).toHaveBeenCalledWith("8080", expect.any(Function));

            expect(mockLoggerInfo).toHaveBeenCalledWith("Server listening on http://localhost:8080");
        });

        it("initializes the database before starting the server", async () => {
            mockInitDB.mockResolvedValue();

            await startServer();

            expect(mockInitDB.mock.invocationCallOrder[0]).toBeLessThan(mockListen.mock.invocationCallOrder[0]);
        });

        it("logs the startup error and exits when initialization fails", async () => {
            const error = new Error("Database unavailable");

            mockInitDB.mockRejectedValue(error);

            const exitSpy = jest
                .spyOn(process, "exit")
                .mockImplementation(() => { });

            await startServer();

            expect(mockLoggerError).toHaveBeenCalledWith(
                { error },
                "Failed to start server"
            );

            expect(exitSpy).toHaveBeenCalledWith(1);

            expect(mockListen).not.toHaveBeenCalled();

            exitSpy.mockRestore();
        });
    });
});
