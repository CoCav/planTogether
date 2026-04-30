import { describe, expect, it } from "vitest";
import { extractApiData } from "../../utils/extractApiData";

/* ==================================================
   EXTRACT API DATA TESTS
   Tests API response extraction helper
================================================== */

describe("extractApiData", () => {
    it("extracts payload from Axios response", () => {
        const response = {
            data: {
                events: [{ id: 1 }]
            },
        };

        expect(extractApiData(response)).toEqual({
            events: [{ id: 1 }]
        });
    });

    it("extracts a specific key from Axios response", () => {
        const response = {
            data: {
                events: [{ id: 1 }]
            },
        };

        expect(extractApiData(response, "events")).toEqual([{ id: 1 }]);
    });

    it("supports already-unwrapped payloads", () => {
        const payload = {
            event: {
                id: 1,
                title: "Test Event"
            },
        };

        expect(extractApiData(payload, "event")).toEqual({
            id: 1,
            title: "Test Event"
        });
    });

    it("returns empty array when key is missing", () => {
        const response = {
            data: {
                events: []
            },
        };

        expect(extractApiData(response, "missing")).toEqual([]);
    });

    it("returns empty array for invalid response", () => {
        expect(extractApiData(null)).toEqual([]);
        expect(extractApiData("invalid")).toEqual([]);
    });
});
