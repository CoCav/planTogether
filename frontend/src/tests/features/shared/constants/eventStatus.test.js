import { describe, expect, it } from "vitest";

import {
    EVENT_STATUS,
    VALID_EVENT_STATUS,
    EVENT_STATUS_LABELS,
    EVENT_STATUS_UI,
    getEventStatusLabel
} from "../../../../features/shared/constants/eventStatus";

/* ==================================================
   EVENT STATUS CONSTANTS TESTS
   Tests shared event status constants

   Handles:
   - event status values
   - valid event statuses
   - event status labels
   - event status UI configuration
   - event status label resolution
================================================== */

describe("eventStatus", () => {

    /* =============================
       EVENT STATUS
    ============================= */

    it("should expose supported event status values", () => {
        expect(EVENT_STATUS).toEqual({
            UPCOMING: "upcoming",
            ONGOING: "ongoing",
            PAST: "past"
        });
    });

    /* =============================
       VALID EVENT STATUS
    ============================= */

    it("should expose valid event status values", () => {
        expect(VALID_EVENT_STATUS).toEqual([
            "upcoming",
            "ongoing",
            "past"
        ]);
    });

    /* =============================
       EVENT STATUS LABELS
    ============================= */

    it("should expose event status labels", () => {
        expect(EVENT_STATUS_LABELS).toEqual({
            upcoming: "Upcoming",
            ongoing: "Ongoing",
            past: "Ended"
        });
    });

    /* =============================
       STATUS LABEL HELPER
    ============================= */

    it("should resolve upcoming status label", () => {
        expect(getEventStatusLabel(EVENT_STATUS.UPCOMING)).toBe("Upcoming");
    });

    it("should resolve ongoing status label", () => {
        expect(getEventStatusLabel(EVENT_STATUS.ONGOING)).toBe("Ongoing");
    });

    it("should resolve ended status label", () => {
        expect(getEventStatusLabel(EVENT_STATUS.PAST)).toBe("Ended");
    });

    it("should fallback to raw status when label is unknown", () => {
        expect(getEventStatusLabel("unknown")).toBe("unknown");
    });

    /* =============================
       EVENT STATUS UI
    ============================= */

    it("should expose event status UI configuration", () => {
        expect(EVENT_STATUS_UI).toEqual({
            upcoming: {
                label: "Upcoming",
                badgeVariant: "upcoming"
            },

            ongoing: {
                label: "Ongoing",
                badgeVariant: "ongoing"
            },

            past: {
                label: "Ended",
                badgeVariant: "past"
            }
        });
    });
});
