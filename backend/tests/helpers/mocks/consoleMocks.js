/* ==================================================
   CONSOLE MOCK HELPERS

   Handles:
   - console.error mocking
   - console.warn mocking
   - console.log mocking

   Notes:
   - shared across unit tests
   - prevents noisy test output
   - restores console methods automatically
================================================== */

// Restore console method only if mocked
const restoreIfMocked = (method) => {
    if (method && typeof method.mockRestore === "function") {
        method.mockRestore();
    }
};

// Mock console.error during tests
const mockConsoleError = () => {
    beforeEach(() => {
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        restoreIfMocked(console.error);
    });
};

// Mock console.warn during tests
const mockConsoleWarn = () => {
    beforeEach(() => {
        jest.spyOn(console, "warn").mockImplementation(() => { });
    });

    afterEach(() => {
        restoreIfMocked(console.warn);
    });
};

// Mock console.log during tests
const mockConsoleLog = () => {
    beforeEach(() => {
        jest.spyOn(console, "log").mockImplementation(() => { });
    });

    afterEach(() => {
        restoreIfMocked(console.log);
    });
};

module.exports = { mockConsoleError, mockConsoleWarn, mockConsoleLog };
