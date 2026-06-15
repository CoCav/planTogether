import { beforeEach, describe, expect, it, vi } from "vitest";

import { searchLocations, searchPublicLocations } from "../../../api/locations/locationApi";

import apiClient from "../../../api/apiClient";

/* ==================================================
   LOCATION API TESTS
   Tests location API requests

   Handles:
   - authenticated location search requests
   - public location search requests
   - query parameter forwarding
   - unwrapped backend payloads

   Notes:
   - authenticated search uses /locations/search
   - public search uses /locations/public-search
   - API helpers return unwrapped backend responses
================================================== */

vi.mock("../../../api/apiClient", () => ({
    default: {
        get: vi.fn()
    }
}));

describe("locationApi", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       AUTHENTICATED LOCATION SEARCH
    ============================= */

    it("should search locations with authenticated endpoint", async () => {
        const mockPayload = {
            success: true,
            locations: [
                {
                    id: 1,
                    query: "montreal",
                    label: "Montréal, Québec, Canada",
                    latitude: 45.5031824,
                    longitude: -73.5698065,
                    provider: "nominatim"
                }
            ]
        };

        apiClient.get.mockResolvedValue({
            data: mockPayload
        });

        const result = await searchLocations("Montreal");

        expect(apiClient.get).toHaveBeenCalledWith("/locations/search", {
            params: {
                q: "Montreal"
            }
        });

        expect(result).toEqual(mockPayload);
    });

    /* =============================
       PUBLIC LOCATION SEARCH
    ============================= */

    it("should search locations with public endpoint", async () => {
        const mockPayload = {
            success: true,
            locations: [
                {
                    id: 1,
                    query: "montreal",
                    label: "Montréal, Québec, Canada",
                    latitude: 45.5031824,
                    longitude: -73.5698065,
                    provider: "nominatim"
                }
            ]
        };

        apiClient.get.mockResolvedValue({
            data: mockPayload
        });

        const result = await searchPublicLocations("Montreal");

        expect(apiClient.get).toHaveBeenCalledWith("/locations/public-search", {
            params: {
                q: "Montreal"
            }
        });

        expect(result).toEqual(mockPayload);
    });
});
