import { describe, expect, it } from "vitest";
import { formatBe, formatCount, formatDate, formatEventDateRange, formatTime } from "../../utils/format";

/* ==================================================
   FORMAT UTILS TESTS
   Tests reusable UI formatting helpers
================================================== */

describe("format utils", () => {
    it("formats date using en-GB by default", () => {
        expect(formatDate("2026-12-20T10:00:00.000Z")).toBe("20/12/2026");
    });

    it("returns fallback when date is missing", () => {
        expect(formatDate(null)).toBe("No date");
    });

    it("formats time with hours and minutes", () => {
        expect(formatTime("2026-12-20T10:00:00.000Z")).toMatch(/\d{2}:\d{2}/);
    });

    it("returns empty string when time is missing", () => {
        expect(formatTime(null)).toBe("");
    });

    it("formats single-day event date range", () => {
        expect(
            formatEventDateRange(
                "2026-12-20T10:00:00.000Z",
                "2026-12-20T12:00:00.000Z"
            )
        ).toBe("20/12/2026");
    });

    it("formats multi-day event date range", () => {
        expect(
            formatEventDateRange(
                "2026-12-20T10:00:00.000Z",
                "2026-12-22T12:00:00.000Z"
            )
        ).toBe("20/12/2026 → 22/12/2026");
    });

    it("formats count with singular and plural labels", () => {
        expect(formatCount(1, "participant")).toBe("1 participant");
        expect(formatCount(2, "participant")).toBe("2 participants");
    });

    it("supports custom plural label", () => {
        expect(formatCount(2, "person", "people")).toBe("2 people");
    });

    it("formats verb agreement", () => {
        expect(formatBe(1)).toBe("is");
        expect(formatBe(2)).toBe("are");
    });
});
