import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useEventMapLocation from "../../../../features/events/hooks/useEventMapLocation";

/* ==================================================
   USE EVENT MAP LOCATION TESTS
   Tests event map geocoding behavior

   Handles:
   - empty location fallback
   - successful geocoding
   - loading state
   - failed requests
   - empty geocoding results
   - trimmed location requests
   - aborted request handling
================================================== */

describe("useEventMapLocation", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const createSuccessfulFetchResponse = (results = []) => ({
        ok: true,
        json: vi.fn().mockResolvedValue(results)
    });

    const createFailedFetchResponse = () => ({
        ok: false,
        json: vi.fn()
    });

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
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

        expect(fetch).not.toHaveBeenCalled();
    });

    it("should return empty fallback state when location only contains spaces", () => {
        const { result } = renderHook(() =>
            useEventMapLocation("   ")
        );

        expect(result.current.coordinates).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe("");

        expect(fetch).not.toHaveBeenCalled();
    });

    it("should return empty fallback state when location is null", () => {
        const { result } = renderHook(() =>
            useEventMapLocation(null)
        );

        expect(result.current.coordinates).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe("");

        expect(fetch).not.toHaveBeenCalled();
    });

    /* =============================
       SUCCESSFUL GEOCODING
    ============================= */

    it("should load coordinates successfully", async () => {
        fetch.mockResolvedValue(
            createSuccessfulFetchResponse([
                {
                    lat: "45.5017",
                    lon: "-73.5673",
                    display_name: "Montréal, Québec, Canada"
                }
            ])
        );

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

        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBe("");
    });

    it("should use original location as label when display name is missing", async () => {
        fetch.mockResolvedValue(
            createSuccessfulFetchResponse([
                {
                    lat: "45.5017",
                    lon: "-73.5673"
                }
            ])
        );

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

    it("should expose loading state while geocoding", async () => {
        let resolveFetch;

        fetch.mockReturnValue(
            new Promise((resolve) => {
                resolveFetch = resolve;
            })
        );

        const { result } = renderHook(() =>
            useEventMapLocation("Montréal")
        );

        await waitFor(() => {
            expect(result.current.isLoading).toBe(true);
        });

        await act(async () => {
            resolveFetch(
                createSuccessfulFetchResponse([
                    {
                        lat: "45.5017",
                        lon: "-73.5673",
                        display_name: "Montréal, Québec, Canada"
                    }
                ])
            );
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
    });

    /* =============================
       ERROR STATES
    ============================= */

    it("should handle failed requests", async () => {
        fetch.mockResolvedValue(createFailedFetchResponse());

        const { result } = renderHook(() =>
            useEventMapLocation("Montréal")
        );

        await waitFor(() => {
            expect(result.current.error).toBe("Location could not be loaded");
        });

        expect(result.current.coordinates).toBeNull();
        expect(result.current.isLoading).toBe(false);
    });

    it("should handle empty geocoding results", async () => {
        fetch.mockResolvedValue(
            createSuccessfulFetchResponse([])
        );

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
        fetch.mockResolvedValue(
            createSuccessfulFetchResponse([
                {
                    lat: "45.5017",
                    lon: "-73.5673",
                    display_name: "Montréal, Québec, Canada"
                }
            ])
        );

        renderHook(() =>
            useEventMapLocation("   Montréal   ")
        );

        await waitFor(() => {
            expect(fetch).toHaveBeenCalled();
        });

        const [url] = fetch.mock.calls[0];

        expect(url).toContain("q=Montr%C3%A9al");
        expect(url).toContain("format=json");
        expect(url).toContain("limit=1");
    });

    it("should send abort signal and JSON accept header", async () => {
        fetch.mockResolvedValue(
            createSuccessfulFetchResponse([
                {
                    lat: "45.5017",
                    lon: "-73.5673",
                    display_name: "Montréal, Québec, Canada"
                }
            ])
        );

        renderHook(() =>
            useEventMapLocation("Montréal")
        );

        await waitFor(() => {
            expect(fetch).toHaveBeenCalled();
        });

        const [, options] = fetch.mock.calls[0];

        expect(options.headers).toEqual({
            Accept: "application/json"
        });

        expect(options.signal).toBeInstanceOf(AbortSignal);
    });

    /* =============================
       ABORT HANDLING
    ============================= */

    it("should ignore aborted request errors", async () => {
        fetch.mockRejectedValue(
            new DOMException("Aborted", "AbortError")
        );

        const { result } = renderHook(() =>
            useEventMapLocation("Montréal")
        );

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.coordinates).toBeNull();
        expect(result.current.error).toBe("");
    });
});
