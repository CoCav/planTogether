import { describe, expect, it } from "vitest";

import { getUserEventEmptyState } from "../../../features/users/userEmptyStates";

/* ==================================================
   USER EVENT EMPTY STATE TESTS
   Tests current user event empty state messages

   Handles:
   - filter-based empty states
   - date-specific empty states
   - current user view empty states
   - default empty state
================================================== */

describe("userEmptyState", () => {

    /* =============================
       FILTER EMPTY STATES
    ============================= */

    it("should return filter-based empty state when filters are active", () => {
        const state = getUserEventEmptyState({
            filters: {
                search: "music"
            }
        });

        expect(state.title).toBe("No events match your filters.");
    });

    it("should return date empty state when date filter is active", () => {
        const state = getUserEventEmptyState({
            filters: {
                date: "2026-04-25"
            }
        });

        expect(state.title).toBe("No events are scheduled for this date.");
    });

    it("should return date range empty state when range filter is active", () => {
        const state = getUserEventEmptyState({
            filters: {
                startDate: "2026-04-25",
                endDate: "2026-04-26"
            }
        });

        expect(state.title).toBe("No events match this date range.");
    });

    /* =============================
       CURRENT USER VIEW EMPTY STATES
    ============================= */

    it("should return created empty state", () => {
        const state = getUserEventEmptyState({
            activeView: "created"
        });

        expect(state.title).toBe("No created events.");
    });

    it("should return created history empty state", () => {
        const state = getUserEventEmptyState({
            activeView: "createdHistory"
        });

        expect(state.title).toBe("No created history.");
    });

    it("should return joined empty state", () => {
        const state = getUserEventEmptyState({
            activeView: "joined"
        });

        expect(state.title).toBe("No joined events.");
    });

    it("should return joined history empty state", () => {
        const state = getUserEventEmptyState({
            activeView: "joinedHistory"
        });

        expect(state.title).toBe("No joined history.");
    });

    it("should return default empty state", () => {
        const state = getUserEventEmptyState({
            activeView: "unknown"
        });

        expect(state.title).toBe("No events found.");
    });
});
