/* ==========================================================================
   System Time Mock Helper

   Builds reusable system time mocks for Jest tests.

   Responsibilities
   - Mock the system time
   - Enable fake timers
   - Restore real timers after each test

   Notes
   - Shared across time-dependent tests.
   - Registers beforeEach and afterEach hooks automatically.
=========================================================================== */

const mockSystemTime = (date) => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date(date));
    });

    afterEach(() => {
        jest.useRealTimers();
    });
};

module.exports = {
    mockSystemTime
};
