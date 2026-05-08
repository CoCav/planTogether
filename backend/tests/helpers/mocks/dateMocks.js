/* ==================================================
   DATE MOCK HELPERS

   Handles:
   - fake timer setup
   - mocked system date configuration
   - timer restoration after tests

   Notes:
   - shared across time-dependent tests
   - restores real timers automatically
================================================== */

// Mock system date for time-dependent tests
const mockSystemDate = (date) => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(date));
    });

    afterEach(() => {
        jest.useRealTimers();
    });
};

module.exports = { mockSystemDate };
