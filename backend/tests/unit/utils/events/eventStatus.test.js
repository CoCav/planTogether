const { EVENT_STATUS } = require("../../../../src/constants/eventStatus");

const {
    hasEventStarted,
    isEventPast,
    getEventStatus,
    assertEventNotPast,
    assertEventNotStarted
} = require("../../../../src/utils/events/eventStatus");

const { mockSystemTime } = require("../../../helpers/mocks/systemTimeTestHelper.js");

/* ==========================================================================
   Event Status Utility Unit Tests

   Tests time-based event status helpers and business rules.

   Responsibilities
   - Test event start detection
   - Test past event detection
   - Test lifecycle status calculation
   - Test past event action protection
   - Test started event deletion protection

   Notes
   - System time is fixed to keep date comparisons deterministic.
   - Event lifecycle statuses use shared constants.
=========================================================================== */

describe("event status utility", () => {
    mockSystemTime("2026-04-25T12:00:00.000Z");

    /* =============================
       EVENT START DETECTION
    ============================= */

    describe("hasEventStarted", () => {
        it.each([
            ["null event", null],
            ["undefined event", undefined],
            ["missing start date", { id: 1 }]
        ])(
            "returns false for %s", (_, event) => {
                expect(hasEventStarted(event)).toBe(false);
            });

        it("returns true when the event started before now", () => {
            expect(hasEventStarted({
                startDateTime: "2026-04-25T11:59:00.000Z"
            })).toBe(true);
        });

        it("returns true when the event starts exactly now", () => {
            expect(hasEventStarted({
                startDateTime: "2026-04-25T12:00:00.000Z"
            })).toBe(true);
        });

        it("returns false when the event starts after now", () => {
            expect(hasEventStarted({
                startDateTime: "2026-04-25T12:01:00.000Z"
            })).toBe(false);
        });
    });

    /* =============================
       PAST EVENT DETECTION
    ============================= */

    describe("isEventPast", () => {
        it.each([
            ["null event", null],
            ["undefined event", undefined],
            ["missing end date", { id: 1 }]
        ])(
            "returns false for %s", (_, event) => {
                expect(isEventPast(event)).toBe(false);
            });

        it("returns true when the event ended before now", () => {
            expect(isEventPast({
                endDateTime: "2026-04-25T11:59:00.000Z"
            })).toBe(true);
        });

        it("returns false when the event ends exactly now", () => {
            expect(isEventPast({
                endDateTime: "2026-04-25T12:00:00.000Z"
            })).toBe(false);
        });

        it("returns false when the event ends after now", () => {
            expect(isEventPast({
                endDateTime: "2026-04-25T12:01:00.000Z"
            })).toBe(false);
        });
    });

    /* =============================
       EVENT STATUS
    ============================= */

    describe("getEventStatus", () => {
        it("returns upcoming for a future event", () => {
            expect(
                getEventStatus({
                    startDateTime: "2026-04-25T13:00:00.000Z",
                    endDateTime: "2026-04-25T14:00:00.000Z"
                })
            ).toBe(EVENT_STATUS.UPCOMING);
        });

        it("returns ongoing for a started event that has not ended", () => {
            expect(
                getEventStatus({
                    startDateTime: "2026-04-25T11:00:00.000Z",
                    endDateTime: "2026-04-25T13:00:00.000Z"
                })
            ).toBe(EVENT_STATUS.ONGOING);
        });

        it("returns ongoing when the event starts exactly now", () => {
            expect(
                getEventStatus({
                    startDateTime: "2026-04-25T12:00:00.000Z",
                    endDateTime: "2026-04-25T13:00:00.000Z"
                })
            ).toBe(EVENT_STATUS.ONGOING);
        });

        it("returns past for an ended event", () => {
            expect(
                getEventStatus({
                    startDateTime: "2026-04-25T10:00:00.000Z",
                    endDateTime: "2026-04-25T11:59:00.000Z"
                })
            ).toBe(EVENT_STATUS.PAST);
        });

        it("returns upcoming when event dates are missing", () => {
            expect(getEventStatus({})).toBe(EVENT_STATUS.UPCOMING);
        });
    });

    /* =============================
       PAST EVENT PROTECTION
    ============================= */

    describe("assertEventNotPast", () => {
        it("does not throw for an event that has not ended", () => {
            expect(() => {
                assertEventNotPast({
                    endDateTime: "2026-04-25T12:01:00.000Z"
                });
            }).not.toThrow();
        });

        it("does not throw when event data is missing", () => {
            expect(() => {
                assertEventNotPast(null);
            }).not.toThrow();
        });

        it("throws a 403 error for a past event", () => {
            let thrownError;

            try {
                assertEventNotPast({
                    endDateTime: "2026-04-25T11:59:00.000Z"
                });
            } catch (error) {
                thrownError = error;
            }

            expect(thrownError).toMatchObject({
                message: "No action is allowed on a past event",
                statusCode: 403
            });
        });
    });

    /* =============================
       STARTED EVENT PROTECTION
    ============================= */

    describe("assertEventNotStarted", () => {
        it("does not throw before the event starts", () => {
            expect(() => {
                assertEventNotStarted({
                    startDateTime: "2026-04-25T12:01:00.000Z"
                });
            }).not.toThrow();
        });

        it("does not throw when event data is missing", () => {
            expect(() => {
                assertEventNotStarted(undefined);
            }).not.toThrow();
        });

        it("throws a 403 error when the event has started", () => {
            let thrownError;

            try {
                assertEventNotStarted({
                    startDateTime: "2026-04-25T12:00:00.000Z"
                });
            } catch (error) {
                thrownError = error;
            }

            expect(thrownError).toMatchObject({
                message: "An event that has already started cannot be deleted",
                statusCode: 403
            });
        });
    });
});
