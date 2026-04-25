import { describe, it, expect } from "vitest";
import { extractApiData } from "../../utils/extractApiData";

describe("extractApiData", () => {
    it("should extract payload from Axios response", () => {
        const response = {
            data: {
                events: [{ id: 1 }]
            }
        };

        expect(extractApiData(response)).toEqual({
            events: [{ id: 1 }]
        });
    });

    it("should extract a specific key from Axios response", () => {
        const response = {
            data: {
                events: [{ id: 1 }]
            }
        };

        expect(extractApiData(response, "events")).toEqual([{ id: 1 }]);
    });

    it("should support already-unwrapped payloads", () => {
        const payload = {
            event: { id: 1, title: "Test Event" }
        };

        expect(extractApiData(payload, "event")).toEqual({
            id: 1,
            title: "Test Event"
        });
    });

    it("should return empty array when key is missing", () => {
        const response = {
            data: {
                events: []
            }
        };

        expect(extractApiData(response, "missing")).toEqual([]);
    });

    it("should return empty array for invalid response", () => {
        expect(extractApiData(null)).toEqual([]);
        expect(extractApiData("invalid")).toEqual([]);
    });
});