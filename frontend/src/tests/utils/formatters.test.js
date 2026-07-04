import { describe, expect, it } from "vitest";

import {
    buildGoogleMapsUrl,
    formatBe,
    formatCount,
    formatDate,
    formatEventDateRange,
    formatLocationDisplayLabel,
    formatLocationInlineLabel,
    formatLocationSelectionLabel,
    formatReviewDate,
    formatTime,
    getLocationDisplayParts,
    getStructuredLocationParts
} from "../../utils/formatters";

/* ==================================================
   FORMATTER UTILS TESTS
   Tests reusable UI formatting helpers

   Handles:
   - date formatting
   - time formatting
   - event date range formatting
   - count labels
   - verb agreement
   - inline location label formatting
   - multi-line location label formatting
   - Google Maps URL generation
   - review date formatting
   - structured location parts
   - selected location input label formatting

   Notes:
   - focuses on pure display helpers
   - date and time assertions avoid timezone-specific values
================================================== */

describe("formatters", () => {

    /* =============================
       DATE / TIME
    ============================= */

    it("should format a valid date", () => {
        expect(formatDate("2026-12-20T10:00:00.000Z")).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it("should return fallback when date is missing", () => {
        expect(formatDate(null)).toBe("No date");
    });

    it("should format a valid time", () => {
        expect(formatTime("2026-12-20T10:00:00.000Z")).toMatch(
            /^([01]\d|2[0-3]):[0-5]\d$/
        );
    });

    it("should return an empty string when time is missing", () => {
        expect(formatTime(null)).toBe("");
    });

    /* =============================
       EVENT DATE RANGE
    ============================= */

    it("should return fallback when start date is missing", () => {
        expect(formatEventDateRange(
            null,
            "2026-12-22T12:00:00.000Z"
        )).toBe("No date");
    });

    it("should format a single-day event date range", () => {
        expect(formatEventDateRange(
            "2026-12-20T10:00:00.000Z",
            "2026-12-20T12:00:00.000Z"
        )).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
    });

    it("should format a multi-day event date range", () => {
        expect(formatEventDateRange(
            "2026-12-20T10:00:00.000Z",
            "2026-12-22T12:00:00.000Z"
        )).toMatch(/^\d{2}\/\d{2}\/\d{4} → \d{2}\/\d{2}\/\d{4}$/);
    });

    /* =============================
       TEXT HELPERS
    ============================= */

    it("should format singular count labels", () => {
        expect(formatCount(1, "participant")).toBe("1 participant");
    });

    it("should format automatic plural count labels", () => {
        expect(formatCount(2, "participant")).toBe("2 participants");
    });

    it("should handle zero count", () => {
        expect(formatCount(0, "participant")).toBe("0 participants");
    });

    it("should format custom plural count labels", () => {
        expect(formatCount(2, "person", "people")).toBe("2 people");
    });

    it("should format verb agreement", () => {
        expect(formatBe(1)).toBe("is");
        expect(formatBe(2)).toBe("are");
    });

    it("should default to plural verb for zero", () => {
        expect(formatBe(0)).toBe("are");
    });

    /* =============================
       LOCATION HELPERS
    ============================= */

    it("should format provider location inline", () => {
        expect(formatLocationInlineLabel({
            label: "Agora du Vieux-Port, Rue de Quercy, Vieux-Québec, Québec, G1K 4B9, Canada"
        })).toBe(
            "Agora du Vieux-Port, Rue de Quercy, Québec, G1K 4B9, Canada"
        );
    });

    it("should format provider location as multi-line display", () => {
        expect(formatLocationDisplayLabel({
            label: "Agora du Vieux-Port, Rue de Quercy, Vieux-Québec, Québec, G1K 4B9, Canada"
        })).toBe(
            "Agora du Vieux-Port\nRue de Quercy\nQuébec, G1K 4B9, Canada"
        );
    });

    it("should build structured location parts", () => {
        expect(getStructuredLocationParts({
            streetAddress: "1500 Rue Sainte-Catherine O",
            city: "Montréal",
            region: "Québec",
            country: "Canada"
        })).toEqual([
            "1500 Rue Sainte-Catherine O",
            "Montréal",
            "Québec",
            "Canada"
        ]);
    });

    it("should prefer structured location parts for display", () => {
        expect(getLocationDisplayParts({
            label: "Long provider label",
            streetAddress: "1500 Rue Sainte-Catherine O",
            city: "Montréal",
            region: "Québec",
            country: "Canada"
        })).toEqual([
            "1500 Rue Sainte-Catherine O",
            "Montréal",
            "Québec",
            "Canada"
        ]);
    });

    it("should fallback to provider label parts when structured fields are missing", () => {
        expect(getLocationDisplayParts({
            label: "Agora du Vieux-Port, Rue de Quercy, Vieux-Québec, Québec, G1K 4B9, Canada"
        })).toEqual([
            "Agora du Vieux-Port",
            "Rue de Quercy",
            "Québec, G1K 4B9, Canada"
        ]);
    });

    it("should format structured location inline", () => {
        expect(formatLocationInlineLabel({
            streetAddress: "1500 Rue Sainte-Catherine O",
            city: "Montréal",
            region: "Québec",
            country: "Canada"
        })).toBe("1500 Rue Sainte-Catherine O, Montréal, Québec, Canada");
    });

    it("should format structured location as multi-line display", () => {
        expect(formatLocationDisplayLabel({
            streetAddress: "1500 Rue Sainte-Catherine O",
            city: "Montréal",
            region: "Québec",
            country: "Canada"
        })).toBe("1500 Rue Sainte-Catherine O\nMontréal\nQuébec\nCanada");
    });

    it("should format selected location using provider label first", () => {
        expect(formatLocationSelectionLabel({
            label: "Agora du Vieux-Port, Rue de Quercy, Québec, Canada",
            streetAddress: "Rue de Quercy",
            city: "Québec",
            country: "Canada"
        })).toBe("Agora du Vieux-Port, Rue de Quercy, Québec, Canada");
    });

    it("should fallback selected location to inline label", () => {
        expect(formatLocationSelectionLabel({
            streetAddress: "Rue de Quercy",
            city: "Québec",
            country: "Canada"
        })).toBe("Rue de Quercy, Québec, Canada");
    });

    it("should return empty string for missing location data", () => {
        expect(formatLocationInlineLabel()).toBe("");
        expect(formatLocationDisplayLabel()).toBe("");
        expect(formatLocationSelectionLabel()).toBe("");
    });

    /* =============================
       GOOGLE MAPS
    ============================= */

    it("should build a Google Maps URL from coordinates", () => {
        expect(buildGoogleMapsUrl(45.5017, -73.5673)).toBe("https://www.google.com/maps?q=45.5017,-73.5673");
    });

    it("should build a Google Maps URL from negative coordinates", () => {
        expect(buildGoogleMapsUrl(-1, -2)).toBe("https://www.google.com/maps?q=-1,-2");
    });

    /* =============================
       REVIEW DATES
    ============================= */

    it("should format a review date", () => {
        expect(formatReviewDate("2026-12-20T10:00:00.000Z")).toMatch(
            /^\d{2} \w{3} \d{4}$/
        );
    });

    it("should return an empty string when review date is missing", () => {
        expect(formatReviewDate(null)).toBe("");
    });
});
