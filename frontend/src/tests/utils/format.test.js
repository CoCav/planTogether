import { describe, it, expect } from "vitest";
import { formatDate, formatTime, formatEventDateRange, formatCount, formatBe } from "../../utils/format";

describe("format utils", () => {
    it("should format date using en-GB by default", () => {
        expect(formatDate("2026-12-20T10:00:00.000Z")).toBe("20/12/2026");
    });

    it("should return fallback when date is missing", () => {
        expect(formatDate(null)).toBe("No date");
    });

    it("should format time with hours and minutes", () => {
        expect(formatTime("2026-12-20T10:00:00.000Z")).toMatch(/\d{2}:\d{2}/);
    });

    it("should return empty string when time is missing", () => {
        expect(formatTime(null)).toBe("");
    });

    it("should format single-day event date range", () => {
        expect(
            formatEventDateRange(
                "2026-12-20T10:00:00.000Z",
                "2026-12-20T12:00:00.000Z"
            )
        ).toBe("20/12/2026");
    });

    it("should format multi-day event date range", () => {
        expect(
            formatEventDateRange(
                "2026-12-20T10:00:00.000Z",
                "2026-12-22T12:00:00.000Z"
            )
        ).toBe("20/12/2026 → 22/12/2026");
    });

    it("should format count with singular and plural", () => {
        expect(formatCount(1, "participant")).toBe("1 participant");
        expect(formatCount(2, "participant")).toBe("2 participants");
    });

    it("should support custom plural label", () => {
        expect(formatCount(2, "person", "people")).toBe("2 people");
    });

    it("should format verb agreement", () => {
        expect(formatBe(1)).toBe("is");
        expect(formatBe(2)).toBe("are");
    });
});