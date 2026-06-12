import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useEventMapLocation from "../../../../../features/events/hooks/form/useEventMapLocation";

import { normalizeApiError } from "../../../../../api/apiError";
import { searchLocations } from "../../../../../api/locations/locationApi";

/* ==================================================
   USE EVENT MAP LOCATION TESTS
   Tests event map location lookup behavior

   Handles:
   - empty location fallback
   - successful backend location lookup
   - fallback label handling
   - loading state
   - failed API requests
   - API not found errors
   - API rate limit errors
   - empty location results
   - trimmed location requests
   - cancelled request handling

   Ensures:
   - hook no longer calls Nominatim directly
   - backend location API is used for map coordinates
   - user-facing errors are normalized
   - stale async updates are ignored after unmount
================================================== */

vi.mock("../../../../../api/locations/locationApi", () => ({
    searchLocations: vi.fn()
}));

vi.mock("../../../../../api/apiError", () => ({
    normalizeApiError: vi.fn()
}));

describe("useEventMapLocation", () => {

    /* =============================
       TEST DATA
    ============================= */

    const successfulLocationResponse = {
        locations: [
            {
                latitude: 45.5017,
                longitude: -73.5673,
                label: "Montréal, Québec, Canada"
            }
        ]
    };

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        normalizeApiError.mockImplementation((error) => error);

        searchLocations.mockResolvedValue(successfulLocationResponse);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       EMPTY LOCATION
    ============================= */

    it("should return empty fallback state when location is empty", () => {
        const { result } = renderHook(() =>
            useEventMapLocation("")
        );

        expect(result.current.coordinates).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe("");

        expect(searchLocations).not.toHaveBeenCalled();
    });

    it("should return empty fallback state when location only contains spaces", () => {
        const { result } = renderHook(() =>
            useEventMapLocation("   ")
        );

        expect(result.current.coordinates).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe("");

        expect(searchLocations).not.toHaveBeenCalled();
    });

    it("should return empty fallback state when location is null", () => {
        const { result } = renderHook(() =>
            useEventMapLocation(null)
        );

        expect(result.current.coordinates).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe("");

        expect(searchLocations).not.toHaveBeenCalled();
    });

    /* =============================
       SUCCESSFUL LOCATION LOOKUP
    ============================= */

    it("should load coordinates successfully", async () => {
        const { result } = renderHook(() =>
            useEventMapLocation("Montréal")
        );

        await waitFor(() => {
            expect(result.current.coordinates).toEqual({
                lat: 45.5017,
                lng: -73.5673,
                label: "Montréal, Québec, Canada"
            });
        });

        expect(searchLocations).toHaveBeenCalledWith("Montréal");

        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe("");
    });

    it("should use original location as label when backend label is missing", async () => {
        searchLocations.mockResolvedValue({
            locations: [
                {
                    latitude: 45.5017,
                    longitude: -73.5673
                }
            ]
        });

        const { result } = renderHook(() =>
            useEventMapLocation("Montréal")
        );

        await waitFor(() => {
            expect(result.current.coordinates).toEqual({
                lat: 45.5017,
                lng: -73.5673,
                label: "Montréal"
            });
        });
    });

    /* =============================
       LOADING STATE
    ============================= */

    it("should expose loading state while location is loading", async () => {
        let resolveSearch;

        searchLocations.mockReturnValue(
            new Promise((resolve) => {
                resolveSearch = resolve;
            })
        );

        const { result } = renderHook(() =>
            useEventMapLocation("Montréal")
        );

        await waitFor(() => {
            expect(result.current.isLoading).toBe(true);
        });

        await act(async () => {
            resolveSearch(successfulLocationResponse);
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
    });

    /* =============================
       ERROR STATES
    ============================= */

    it("should handle failed API requests", async () => {
        const apiError = {
            status: 500
        };

        searchLocations.mockRejectedValue(apiError);
        normalizeApiError.mockReturnValue(apiError);

        const { result } = renderHook(() =>
            useEventMapLocation("Montréal")
        );

        await waitFor(() => {
            expect(result.current.error).toBe("Location could not be loaded");
        });

        expect(result.current.coordinates).toBeNull();
        expect(result.current.isLoading).toBe(false);
    });

    it("should handle API not found errors", async () => {
        const apiError = {
            status: 404
        };

        searchLocations.mockRejectedValue(apiError);
        normalizeApiError.mockReturnValue(apiError);

        const { result } = renderHook(() =>
            useEventMapLocation("Unknown place")
        );

        await waitFor(() => {
            expect(result.current.error).toBe("Location could not be found");
        });

        expect(result.current.coordinates).toBeNull();
        expect(result.current.isLoading).toBe(false);
    });

    it("should handle API rate limit errors", async () => {
        const apiError = {
            status: 429
        };

        searchLocations.mockRejectedValue(apiError);
        normalizeApiError.mockReturnValue(apiError);

        const { result } = renderHook(() =>
            useEventMapLocation("Montréal")
        );

        await waitFor(() => {
            expect(result.current.error).toBe(
                "Location search is temporarily limited. Please try again later."
            );
        });

        expect(result.current.coordinates).toBeNull();
        expect(result.current.isLoading).toBe(false);
    });

    it("should handle empty location results", async () => {
        searchLocations.mockResolvedValue({
            locations: []
        });

        const { result } = renderHook(() =>
            useEventMapLocation("Unknown place")
        );

        await waitFor(() => {
            expect(result.current.error).toBe("Location could not be found");
        });

        expect(result.current.coordinates).toBeNull();
        expect(result.current.isLoading).toBe(false);
    });

    /* =============================
       REQUEST PARAMS
    ============================= */

    it("should trim location before making the request", async () => {
        renderHook(() =>
            useEventMapLocation("   Montréal   ")
        );

        await waitFor(() => {
            expect(searchLocations).toHaveBeenCalledWith("Montréal");
        });
    });

    /* =============================
       CANCELLATION HANDLING
    ============================= */

    it("should ignore stale updates after unmount", async () => {
        let resolveSearch;

        searchLocations.mockReturnValue(
            new Promise((resolve) => {
                resolveSearch = resolve;
            })
        );

        const { result, unmount } = renderHook(() =>
            useEventMapLocation("Montréal")
        );

        unmount();

        await act(async () => {
            resolveSearch(successfulLocationResponse);
        });

        expect(result.current.coordinates).toBeNull();
    });
});
