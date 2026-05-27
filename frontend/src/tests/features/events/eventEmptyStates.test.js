import { describe, expect, it } from "vitest";

import { getEventEmptyStates } from "../../../features/events/eventEmptyStates";

import { EVENT_STATUS } from "../../../features/shared/constants/eventStatus";

/* ==================================================
   EVENT EMPTY STATE TESTS
   Tests public event empty state messages

   Handles:
   - filter-based empty states
   - date-specific empty states
   - ongoing view empty state
   - upcoming view empty state
   - archived view empty state
   - default empty state
================================================== */

describe("eventEmptyState", () => {

    /* =============================
       FILTER EMPTY STATES
    ============================= */

    it("should return filter-based empty state when filters are active", () => {
        const state = getEventEmptyStates({
            filters: {
                search: "music"
            }
        });

        expect(state.title).toBe("No events match your filters.");
    });

    it("should return date empty state when date filter is active", () => {
        const state = getEventEmptyStates({
            filters: {
                date: "2026-04-25"
            }
        });

        expect(state.title).toBe("No events are scheduled for this date.");
    });

    it("should return date range empty state when range filter is active", () => {
        const state = getEventEmptyStates({
            filters: {
                startDate: "2026-04-25",
                endDate: "2026-04-26"
            }
        });

        expect(state.title).toBe("No events match this date range.");
    });

    /* =============================
       PUBLIC VIEW EMPTY STATES
    ============================= */

    it("should return ongoing empty state", () => {
        const state = getEventEmptyStates({
            activeView: EVENT_STATUS.ONGOING
        });

        expect(state.title).toBe("No ongoing events.");
    });

    it("should return upcoming empty state", () => {
        const state = getEventEmptyStates({
            activeView: EVENT_STATUS.UPCOMING
        });

        expect(state.title).toBe("No upcoming events.");
    });

    it("should return past empty state", () => {
        const state = getEventEmptyStates({
            activeView: EVENT_STATUS.PAST
        });

        expect(state.title).toBe("No archived events.");
    });

    it("should return ongoing empty state by default", () => {
        const state = getEventEmptyStates({});

        expect(state.title).toBe("No ongoing events.");
    });

    it("should return fallback empty state for unknown view", () => {
        const state = getEventEmptyStates({
            activeView: "unknown"
        });

        expect(state.title).toBe("No events found.");
    });
});
