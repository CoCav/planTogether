/* ==================================================
   EVENT STATUS TESTS

   Tests:
   - event start detection
   - past event detection
   - missing event handling
   - event status computation
   - past event action protection
   - started event deletion protection

   Ensures:
   - started events are detected from startDateTime
   - event status is computed from event start and end dates
   - upcoming and ongoing events remain actionable where allowed
   - past events throw a 403 business error
   - started events cannot be deleted
   - shared event status constants are used for expected statuses
================================================== */

const { EVENT_STATUS } = require("../../../../src/constants/eventStatus");

const {
    hasEventStarted,
    isEventPast,
    getEventStatus,
    assertEventNotPast,
    assertEventNotStarted
} = require("../../../../src/utils/events/eventStatus");

const { mockSystemDate } = require("../../../helpers/mocks/dateMocks");

describe("eventStatus utils", () => {

    mockSystemDate("2026-04-25T12:00:00.000Z");

    /* =============================
       STARTED EVENT DETECTION
    ============================= */

    it("should return false when checking started state for missing event", () => {
        expect(hasEventStarted(null)).toBe(false);
        expect(hasEventStarted(undefined)).toBe(false);
    });

    it("should return false when startDateTime is missing", () => {
        expect(hasEventStarted({ id: 1 })).toBe(false);
    });

    it("should return true when event startDateTime is before now", () => {
        expect(
            hasEventStarted({
                startDateTime: "2026-04-25T11:59:00.000Z"
            })
        ).toBe(true);
    });

    it("should return true when event startDateTime is equal to now", () => {
        expect(
            hasEventStarted({
                startDateTime: "2026-04-25T12:00:00.000Z"
            })
        ).toBe(true);
    });

    it("should return false when event startDateTime is after now", () => {
        expect(
            hasEventStarted({
                startDateTime: "2026-04-25T12:01:00.000Z"
            })
        ).toBe(false);
    });

    /* =============================
       PAST EVENT DETECTION
    ============================= */

    it("should return false when checking past state for missing event", () => {
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

    /* =============================
       EVENT STATUS COMPUTATION
    ============================= */

    it("should return upcoming status for future event", () => {
        expect(
            getEventStatus({
                startDateTime: "2026-04-25T13:00:00.000Z",
                endDateTime: "2026-04-25T14:00:00.000Z"
            })
        ).toBe(EVENT_STATUS.UPCOMING);
    });

    it("should return ongoing status for started event that has not ended", () => {
        expect(
            getEventStatus({
                startDateTime: "2026-04-25T11:00:00.000Z",
                endDateTime: "2026-04-25T13:00:00.000Z"
            })
        ).toBe(EVENT_STATUS.ONGOING);
    });

    it("should return ongoing status when event starts exactly now", () => {
        expect(
            getEventStatus({
                startDateTime: "2026-04-25T12:00:00.000Z",
                endDateTime: "2026-04-25T13:00:00.000Z"
            })
        ).toBe(EVENT_STATUS.ONGOING);
    });

    it("should return past status for past event", () => {
        expect(
            getEventStatus({
                endDateTime: "2026-04-25T11:59:00.000Z"
            })
        ).toBe(EVENT_STATUS.PAST);
    });

    /* =============================
       PAST EVENT ACTION PROTECTION
    ============================= */

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

    /* =============================
       STARTED EVENT DELETION PROTECTION
    ============================= */

    it("should not throw when event has not started", () => {
        expect(() =>
            assertEventNotStarted({
                startDateTime: "2026-04-25T12:01:00.000Z"
            })
        ).not.toThrow();
    });

    it("should throw 403 error when event has already started", () => {
        expect(() =>
            assertEventNotStarted({
                startDateTime: "2026-04-25T12:00:00.000Z"
            })
        ).toThrow("An event that has already started cannot be deleted");

        try {
            assertEventNotStarted({
                startDateTime: "2026-04-25T12:00:00.000Z"
            });
        } catch (error) {
            expect(error.statusCode).toBe(403);
        }
    });
});
