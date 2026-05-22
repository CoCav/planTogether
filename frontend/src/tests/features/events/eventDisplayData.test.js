import { describe, expect, it } from "vitest";

import { getEventDisplayData } from "../../../features/events/eventDisplayData";

import { EVENT_MODES } from "../../../features/shared/constants/eventModes";

import { createEvent } from "../../factories/events/eventFactory";

/* ==================================================
   EVENT DISPLAY DATA TESTS
   Tests event display data generation

   Handles:
   - fallback display values
   - formatted date and time
   - display mode labels
   - display mode and location handling
   - capacity display
   - registration deadline display
   - nullable display fields

   Notes:
   - focuses on display-ready transformation logic
   - uses shared event test factory
================================================== */

describe("getEventDisplayData", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const getDisplayData = (overrides = {}) => {
        return getEventDisplayData(
            createEvent(overrides)
        );
    };

    /* =============================
       FALLBACK VALUES
    ============================= */

    it("should use fallback description when missing", () => {
        const data = getDisplayData({
            description: ""
        });

        expect(data.description).toBe(
            "No description provided."
        );
    });

    it("should use fallback type when missing", () => {
        const data = getDisplayData({
            type: ""
        });

        expect(data.type).toBe("N/A");
    });

    it("should use fallback theme when missing", () => {
        const data = getDisplayData({
            theme: ""
        });

        expect(data.theme).toBe("N/A");
    });

    /* =============================
       DATE AND TIME
    ============================= */

    it("should format event date range", () => {
        const data = getDisplayData();

        expect(data.date).toBeTruthy();
    });

    it("should format event time range", () => {
        const data = getDisplayData();

        expect(data.time).toContain("→");
    });

    /* =============================
       EVENT MODE
    ============================= */

    it("should return display label for online mode", () => {
        const data = getDisplayData({
            mode: EVENT_MODES.ONLINE
        });

        expect(data.mode).toBe("Online");
    });

    it("should return display label for in-person mode", () => {
        const data = getDisplayData({
            mode: EVENT_MODES.IN_PERSON
        });

        expect(data.mode).toBe("In person");
    });

    /* =============================
       LOCATION
    ============================= */

    it("should use online location label for online events", () => {
        const data = getDisplayData({
            mode: EVENT_MODES.ONLINE,
            location: "Montreal"
        });

        expect(data.location).toBe("Online");
    });

    it("should use event location for in-person events", () => {
        const data = getDisplayData({
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal"
        });

        expect(data.location).toBe("Montreal");
    });

    it("should use fallback location when missing", () => {
        const data = getDisplayData({
            mode: EVENT_MODES.IN_PERSON,
            location: ""
        });

        expect(data.location).toBe("N/A");
    });

    /* =============================
       CAPACITY
    ============================= */

    it("should return formatted capacity when participant limit exists", () => {
        const data = getDisplayData({
            participantCount: 3,
            maxParticipants: 10
        });

        expect(data.capacity).toBe("3 / 10");
    });

    it("should return null capacity when participant limit does not exist", () => {
        const data = getDisplayData({
            maxParticipants: null
        });

        expect(data.capacity).toBeNull();
    });

    it("should return null capacity when max participants is zero", () => {
        const data = getDisplayData({
            participantCount: 0,
            maxParticipants: 0
        });

        expect(data.capacity).toBeNull();
    });

    /* =============================
       REGISTRATION DEADLINE
    ============================= */

    it("should return formatted registration deadline", () => {
        const data = getDisplayData({
            registrationDeadline: "2026-12-19T12:00:00.000Z"
        });

        expect(data.registrationDeadline).toBeTruthy();
    });

    it("should return null registration deadline when missing", () => {
        const data = getDisplayData({
            registrationDeadline: null
        });

        expect(data.registrationDeadline).toBeNull();
    });
});
