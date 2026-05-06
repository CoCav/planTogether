/* ==================================================
   EVENT STATUS TESTS

   Tests:
   - past event detection
   - missing event handling
   - event status computation
   - past event action protection

   Ensures:
   - event status is based on endDateTime
   - active/future events remain actionable
   - past events throw a 403 business error
================================================== */

const { isEventPast, getEventStatus, assertEventNotPast } = require("../../../src/utils/eventStatus");

describe("eventStatus utils", () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(
            new Date("2026-04-25T12:00:00.000Z").getTime()
        );
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should return false when event is missing", () => {
        expect(isEventPast(null)).toBe(false);
        expect(isEventPast(undefined)).toBe(false);
    });

    it("should return false when endDateTime is missing", () => {
        expect(isEventPast({ id: 1 })).toBe(false);
    });

    it("should return true when event endDateTime is before now", () => {
        expect(
            isEventPast({
                endDateTime: "2026-04-25T11:59:00.000Z"
            })
        ).toBe(true);
    });

    it("should return false when event endDateTime is equal to now", () => {
        expect(
            isEventPast({
                endDateTime: "2026-04-25T12:00:00.000Z"
            })
        ).toBe(false);
    });

    it("should return false when event endDateTime is after now", () => {
        expect(
            isEventPast({
                endDateTime: "2026-04-25T12:01:00.000Z"
            })
        ).toBe(false);
    });

    it("should return past status for past event", () => {
        expect(
            getEventStatus({
                endDateTime: "2026-04-25T11:59:00.000Z"
            })
        ).toBe("past");
    });

    it("should return upcoming status for active or future event", () => {
        expect(
            getEventStatus({
                endDateTime: "2026-04-25T12:01:00.000Z"
            })
        ).toBe("upcoming");
    });

    it("should not throw for upcoming event", () => {
        expect(() =>
            assertEventNotPast({
                endDateTime: "2026-04-25T12:01:00.000Z"
            })
        ).not.toThrow();
    });

    it("should throw 403 error for past event", () => {
        expect(() =>
            assertEventNotPast({
                endDateTime: "2026-04-25T11:59:00.000Z"
            })
        ).toThrow("No action is allowed on a past event");

        try {
            assertEventNotPast({
                endDateTime: "2026-04-25T11:59:00.000Z"
            });
        } catch (error) {
            expect(error.statusCode).toBe(403);
        }
    });
});
