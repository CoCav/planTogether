import { describe, expect, it } from "vitest";

import {
    formatBe,
    formatCount,
    formatDate,
    formatEventDateRange,
    formatLocationDisplayLabel,
    formatLocationInlineLabel,
    formatTime
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
================================================== */

describe("formatters", () => {

    /* =============================
       DATE / TIME
    ============================= */

    it("should format a valid date", () => {
        expect(formatDate("2026-12-20T10:00:00.000Z")).toBe("20/12/2026");
    });

    it("should return fallback when date is missing", () => {
        expect(formatDate(null)).toBe("No date");
    });

    it("should format a valid time", () => {
        expect(formatTime("2026-12-20T10:00:00.000Z")).toMatch(/\d{2}:\d{2}/);
    });

    it("should return an empty string when time is missing", () => {
        expect(formatTime(null)).toBe("");
    });

    /* =============================
       EVENT DATE RANGE
    ============================= */

    it("should format start date only when end date is missing", () => {
        expect(formatEventDateRange(
            "2026-12-20T10:00:00.000Z",
            null
        )).toBe("20/12/2026");
    });

    it("should format a single-day event date range", () => {
        expect(formatEventDateRange(
            "2026-12-20T10:00:00.000Z",
            "2026-12-20T12:00:00.000Z"
        )).toBe("20/12/2026");
    });

    it("should format a multi-day event date range", () => {
        expect(formatEventDateRange(
            "2026-12-20T10:00:00.000Z",
            "2026-12-22T12:00:00.000Z"
        )).toBe("20/12/2026 → 22/12/2026");
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

    it("should format custom plural count labels", () => {
        expect(formatCount(2, "person", "people")).toBe("2 people");
    });

    it("should format verb agreement", () => {
        expect(formatBe(1)).toBe("is");
        expect(formatBe(2)).toBe("are");
    });

    /* =============================
       LOCATION HELPERS
    ============================= */

    it("should format short location labels inline", () => {
        expect(formatLocationInlineLabel("Central Park, New York, USA")).toBe("Central Park, New York, USA");
    });

    it("should format long provider location labels inline", () => {
        expect(formatLocationInlineLabel(
            "Agora du Vieux-Port, Rue de Quercy, Vieux-Québec, Québec, G1K 4B9, Canada"
        )).toBe("Agora du Vieux-Port, Rue de Quercy, Québec, G1K 4B9, Canada");
    });

    it("should trim empty location label parts inline", () => {
        expect(formatLocationInlineLabel("Central Park, , New York, USA")).toBe("Central Park, New York, USA");
    });

    it("should return empty string for missing inline location label", () => {
        expect(formatLocationInlineLabel()).toBe("");
    });

    it("should format short location labels as multi-line display", () => {
        expect(formatLocationDisplayLabel("Central Park, New York, USA")).toBe("Central Park\nNew York\nUSA");
    });

    it("should format long provider location labels as multi-line display", () => {
        expect(formatLocationDisplayLabel(
            "Agora du Vieux-Port, Rue de Quercy, Vieux-Québec, Québec, G1K 4B9, Canada"
        )).toBe("Agora du Vieux-Port\nRue de Quercy\nQuébec, G1K 4B9, Canada");
    });

    it("should trim empty location label parts for multi-line display", () => {
        expect(formatLocationDisplayLabel("Central Park, , New York, USA")).toBe("Central Park\nNew York\nUSA");
    });

    it("should return empty string for missing multi-line location label", () => {
        expect(formatLocationDisplayLabel()).toBe("");
    });
});
