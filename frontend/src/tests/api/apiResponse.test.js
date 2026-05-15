import { describe, expect, it } from "vitest";

import { getApiPayload, getPaginatedPayload, unwrapApiResponse } from "../../api/apiResponse";

/* ==================================================
   API RESPONSE TESTS
   Tests standardized backend response helpers

   Handles:
   - Axios response unwrapping
   - payload extraction
   - paginated payload normalization
================================================== */

describe("apiResponse", () => {

    /* =============================
       RESPONSE UNWRAPPING
    ============================= */

    it("should unwrap Axios response data", () => {
        const response = {
            data: {
                success: true,
                message: "OK"
            }
        };

        expect(unwrapApiResponse(response)).toEqual(response.data);
    });

    it("should return the response itself when data is missing", () => {
        const response = {
            success: true,
            message: "OK"
        };

        expect(unwrapApiResponse(response)).toEqual(response);
    });

    /* =============================
       PAYLOAD EXTRACTION
    ============================= */

    it("should extract a specific payload property", () => {
        const response = {
            data: {
                user: {
                    id: 1,
                    name: "John Doe"
                }
            }
        };

        expect(getApiPayload(response, "user")).toEqual({
            id: 1,
            name: "John Doe"
        });
    });

    it("should return the full payload when no key is provided", () => {
        const response = {
            data: {
                success: true,
                message: "OK"
            }
        };

        expect(getApiPayload(response)).toEqual(response.data);
    });

    /* =============================
       PAGINATED PAYLOAD
    ============================= */

    it("should normalize paginated payloads with explicit totalItems", () => {
        const response = {
            data: {
                events: [{ id: 1 }],
                page: 2,
                pageSize: 10,
                totalItems: 25,
                totalPages: 3,
                success: true,
                message: "Events retrieved"
            }
        };

        expect(getPaginatedPayload(response, "events")).toEqual({
            items: [{ id: 1 }],
            pagination: {
                page: 2,
                pageSize: 10,
                totalItems: 25,
                totalPages: 3
            },
            success: true,
            message: "Events retrieved"
        });
    });

    it("should fallback to totalEvents when totalItems is missing", () => {
        const response = {
            data: {
                events: [{ id: 1 }],
                totalEvents: 12
            }
        };

        expect(getPaginatedPayload(response, "events").pagination.totalItems).toBe(12);
    });

    it("should return default pagination values when metadata is missing", () => {
        expect(getPaginatedPayload({}, "events")).toEqual({
            items: [],
            pagination: {
                page: 1,
                pageSize: null,
                totalItems: 0,
                totalPages: 1
            },
            success: false,
            message: ""
        });
    });
});
