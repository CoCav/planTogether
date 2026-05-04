import { describe, expect, it } from "vitest";
import { getEventsEmptyState } from "../../../features/events/eventEmptyState";

/* ==================================================
   EVENT EMPTY STATES TESTS
   Tests contextual empty state messages
================================================== */

describe("eventEmptyStates", () => {

    it("returns filter-based empty state when filters are active", () => {
        const state = getEventsEmptyState({
            filters: { search: "music" }
        });

        expect(state.title).toBe("No events match your filters.");
    });

    it("returns date empty state when date filter is active", () => {
        const state = getEventsEmptyState({
            filters: { date: "2026-04-25" }
        });

        expect(state.title).toBe("No events are scheduled for this date.");
    });

    it("returns date range empty state when range filter is active", () => {
        const state = getEventsEmptyState({
            filters: { startDate: "2026-04-25", endDate: "2026-04-26" }
        });

        expect(state.title).toBe("No events match this date range.");
    });

    it("returns upcoming empty state", () => {
        const state = getEventsEmptyState({
            activeView: "upcoming"
        });

        expect(state.title).toBe("No upcoming events.");
    });

    it("returns archives empty state", () => {
        const state = getEventsEmptyState({
            activeView: "archives"
        });

        expect(state.title).toBe("No archived events.");
    });

    it("returns default empty state", () => {
        const state = getEventsEmptyState({});

        expect(state.title).toBe("No events found.");
    });

    it("returns created empty state", () => {
        const state = getEventsEmptyState({
            activeView: "created"
        });

        expect(state.title).toBe("No created events.");
    });

    it("returns joined empty state", () => {
        const state = getEventsEmptyState({
            activeView: "joined"
        });

        expect(state.title).toBe("No joined events.");
    });
});
