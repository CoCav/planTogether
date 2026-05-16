import { describe, expect, it } from "vitest";

import { getEventEmptyState } from "../../../features/events/eventEmptyStates";

import { EVENT_STATUS } from "../../../features/shared/eventStatus";

/* ==================================================
   EVENT EMPTY STATE TESTS
   Tests public event empty state messages

   Handles:
   - filter-based empty states
   - date-specific empty states
   - public event view empty states
   - default empty state
================================================== */

describe("eventEmptyState", () => {

    /* =============================
       FILTER EMPTY STATES
    ============================= */

    it("should return filter-based empty state when filters are active", () => {
        const state = getEventEmptyState({
            filters: {
                search: "music"
            }
        });

        expect(state.title).toBe("No events match your filters.");
    });

    it("should return date empty state when date filter is active", () => {
        const state = getEventEmptyState({
            filters: {
                date: "2026-04-25"
            }
        });

        expect(state.title).toBe("No events are scheduled for this date.");
    });

    it("should return date range empty state when range filter is active", () => {
        const state = getEventEmptyState({
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

    it("should return upcoming empty state", () => {
        const state = getEventEmptyState({
            activeView: EVENT_STATUS.UPCOMING
        });

        expect(state.title).toBe("No upcoming events.");
    });

    it("should return past empty state", () => {
        const state = getEventEmptyState({
            activeView: EVENT_STATUS.PAST
        });

        expect(state.title).toBe("No archived events.");
    });

    it("should return default empty state", () => {
        const state = getEventEmptyState({});

        expect(state.title).toBe("No events found.");
    });
});
