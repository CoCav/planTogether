import { describe, expect, it } from "vitest";

import { getEventDisplayData } from "../../../features/events/eventDisplayData";

import { EVENT_MODES } from "../../../features/shared/constants/eventModes";
import { EVENT_STATUS } from "../../../features/shared/constants/eventStatus";

import { createEvent } from "../../factories/events/eventFactory";

/* ==================================================
   EVENT DISPLAY DATA TESTS
   Tests event display data generation

   Handles:
   - fallback display values
   - formatted date and time
   - online and in-person display modes
   - inline location display formatting
   - selected location map data
   - participant and capacity display
   - registration deadline display
   - nullable display fields
   - review count and average rating display
   - review summary label display

   Notes:
   - focuses on display-ready transformation logic
   - selectedLocation supports event map rendering
   - reviewLabel is only returned when ratings exist
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
            location: "Montreal",
            locationLabel: ""
        });

        expect(data.location).toBe("Montreal");
    });

    it("should use fallback location when missing", () => {
        const data = getDisplayData({
            mode: EVENT_MODES.IN_PERSON,
            location: "",
            locationLabel: "",
            selectedLocation: null
        });

        expect(data.location).toBe("N/A");
    });

    it("should build selected location when event has coordinates", () => {
        const data = getDisplayData({
            mode: EVENT_MODES.IN_PERSON,
            location: "Central Park",
            locationLabel: "Central Park, New York, USA",
            latitude: 40.785091,
            longitude: -73.968285
        });

        expect(data.selectedLocation).toEqual({
            label: "Central Park, New York, USA",
            latitude: 40.785091,
            longitude: -73.968285,
            provider: "nominatim"
        });
    });

    it("should fallback to event location when selected location label is missing", () => {
        const data = getDisplayData({
            mode: EVENT_MODES.IN_PERSON,
            location: "Central Park",
            locationLabel: "",
            latitude: 40.785091,
            longitude: -73.968285
        });

        expect(data.selectedLocation).toEqual({
            label: "Central Park",
            latitude: 40.785091,
            longitude: -73.968285,
            provider: "nominatim"
        });
    });

    it("should return null selected location when coordinates are missing", () => {
        const data = getDisplayData({
            mode: EVENT_MODES.IN_PERSON,
            location: "Central Park",
            latitude: null,
            longitude: null
        });

        expect(data.selectedLocation).toBeNull();
    });

    it("should return null selected location for online events", () => {
        const data = getDisplayData({
            mode: EVENT_MODES.ONLINE,
            location: "Central Park",
            locationLabel: "Central Park, New York, USA",
            latitude: 40.785091,
            longitude: -73.968285
        });

        expect(data.selectedLocation).toBeNull();
    });

    it("should prefer persisted location label for display location", () => {
        const data = getDisplayData({
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",
            locationLabel:
                "Agora du Vieux-Port, Rue de Quercy, Québec, G1K 4B9, Canada"
        });

        expect(data.location).toBe("Agora du Vieux-Port, Rue de Quercy, Québec, G1K 4B9, Canada");
    });

    it("should fallback to selected location label when persisted label is missing", () => {
        const data = getDisplayData({
            mode: EVENT_MODES.IN_PERSON,
            location: "Montreal",

            locationLabel: "",

            selectedLocation: {
                label:
                    "Agora du Vieux-Port, Rue de Quercy, Québec, G1K 4B9, Canada"
            }
        });

        expect(data.location).toBe("Agora du Vieux-Port, Rue de Quercy, Québec, G1K 4B9, Canada");
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
       REVIEWS
    ============================= */

    it("should return review stats", () => {
        const data = getDisplayData({
            reviewCount: 2,
            averageRating: 4.5
        });

        expect(data.reviewCount).toBe(2);
        expect(data.averageRating).toBe(4.5);
    });

    it("should return review label when ratings exist", () => {
        const data = getDisplayData({
            reviewCount: 2,
            averageRating: 4.5
        });

        expect(data.reviewLabel).toBe("4.5 ★ (2 reviews)");
    });

    it("should return singular review label", () => {
        const data = getDisplayData({
            reviewCount: 1,
            averageRating: 5
        });

        expect(data.reviewLabel).toBe("5 ★ (1 review)");
    });

    it("should return null review label when review count is zero", () => {
        const data = getDisplayData({
            reviewCount: 0,
            averageRating: null
        });

        expect(data.reviewLabel).toBeNull();
    });

    it("should return null review label when average rating is missing", () => {
        const data = getDisplayData({
            reviewCount: 2,
            averageRating: null
        });

        expect(data.reviewLabel).toBeNull();
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

    /* =============================
       EVENT STATUS
    ============================= */

    it("should return event status", () => {
        const data = getDisplayData({
            status: EVENT_STATUS.ONGOING
        });

        expect(data.status).toBe(EVENT_STATUS.ONGOING);
    });
});
