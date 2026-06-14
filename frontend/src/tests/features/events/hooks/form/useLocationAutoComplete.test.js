import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import useLocationAutocomplete from "../../../../../features/events/hooks/form/useLocationAutoComplete";

import { searchLocations } from "../../../../../api/locations/locationApi";

/* ==================================================
   USE LOCATION AUTOCOMPLETE TESTS
   Tests event location autocomplete behavior

   Handles:
   - short query reset
   - debounced backend search
   - suggestion state
   - loading state
   - no-results error state
   - rate limit error state
   - generic error state
   - suggestion selection
   - keyboard navigation
   - dropdown closing
   - stale request cancellation

   Notes:
   - mocks backend location search API
   - uses fake timers to control debounce behavior
   - focuses on hook state and actions only
================================================== */

vi.mock("../../../../../api/locations/locationApi", () => ({
    searchLocations: vi.fn()
}));

describe("useLocationAutocomplete", () => {

    /* =============================
       TEST DATA
    ============================= */

    const locationSuggestions = [
        {
            label: "Central Park, Manhattan, New York, USA",
            latitude: 40.785091,
            longitude: -73.968285,
            provider: "nominatim"
        },
        {
            label: "Central Park Zoo, Manhattan, New York, USA",
            latitude: 40.7678,
            longitude: -73.9718,
            provider: "nominatim"
        }
    ];

    /* =============================
       TEST HELPERS
    ============================= */

    const setupHook = ({
        value = "Central Park",
        onSelectLocation = vi.fn(),
        debounceDelay = 500,
        minQueryLength = 2
    } = {}) => {
        const hook = renderHook((props) =>
            useLocationAutocomplete(props),
            {
                initialProps: {
                    value,
                    onSelectLocation,
                    debounceDelay,
                    minQueryLength
                }
            });

        return {
            ...hook,
            onSelectLocation
        };
    };

    const flushDebounce = async (duration = 500) => {
        await act(async () => {
            vi.advanceTimersByTime(duration);
            await Promise.resolve();
        });
    };

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.useFakeTimers();

        searchLocations.mockResolvedValue({
            locations: locationSuggestions
        });
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    /* =============================
       SEARCH STATE
    ============================= */

    it("should reset autocomplete state when query is too short", () => {
        const { result } = setupHook({
            value: "C",
            minQueryLength: 2
        });

        expect(result.current.autocompleteState.suggestions).toEqual([]);
        expect(result.current.autocompleteState.error).toBe("");
        expect(result.current.autocompleteState.isLoading).toBe(false);
        expect(result.current.autocompleteState.isOpen).toBe(false);
        expect(result.current.autocompleteState.highlightedIndex).toBe(-1);

        expect(searchLocations).not.toHaveBeenCalled();
    });

    it("should search locations after debounce delay", async () => {
        const { result } = setupHook({
            value: "Central Park"
        });

        expect(searchLocations).not.toHaveBeenCalled();

        await flushDebounce();

        expect(searchLocations).toHaveBeenCalledWith("Central Park");

        expect(result.current.autocompleteState.suggestions).toEqual(locationSuggestions);
        expect(result.current.autocompleteState.isOpen).toBe(true);
        expect(result.current.autocompleteState.highlightedIndex).toBe(0);
    });

    it("should trim query before searching", async () => {
        setupHook({
            value: "   Central Park   "
        });

        await flushDebounce();

        await act(async () => {
            await Promise.resolve();
        });

        expect(searchLocations).toHaveBeenCalledWith("Central Park");
    });

    it("should expose loading state while searching", async () => {
        let resolveSearch;

        searchLocations.mockReturnValue(
            new Promise((resolve) => {
                resolveSearch = resolve;
            })
        );

        const { result } = setupHook({
            value: "Central Park"
        });

        await flushDebounce();

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.autocompleteState.isLoading).toBe(true);

        await act(async () => {
            resolveSearch({
                locations: locationSuggestions
            });

            await Promise.resolve();
        });

        expect(result.current.autocompleteState.isLoading).toBe(false);
    });

    it("should open dropdown with no highlighted option when search returns no suggestions", async () => {
        searchLocations.mockResolvedValue({
            locations: []
        });

        const { result } = setupHook({
            value: "Central Park"
        });

        await flushDebounce();

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.autocompleteState.suggestions).toEqual([]);
        expect(result.current.autocompleteState.isOpen).toBe(true);
        expect(result.current.autocompleteState.highlightedIndex).toBe(-1);
    });

    /* =============================
       ERROR STATES
    ============================= */

    it("should expose no-results error when backend returns 404", async () => {
        searchLocations.mockRejectedValue({
            response: {
                status: 404,
                data: {
                    message: "Location not found"
                }
            }
        });

        const { result } = setupHook({
            value: "Unknown place"
        });

        await flushDebounce();

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.autocompleteState.error).toBe("No matching location found");

        expect(result.current.autocompleteState.suggestions).toEqual([]);
        expect(result.current.autocompleteState.isOpen).toBe(true);
        expect(result.current.autocompleteState.highlightedIndex).toBe(-1);
    });

    it("should expose rate limit error when backend returns 429", async () => {
        searchLocations.mockRejectedValue({
            response: {
                status: 429,
                data: {
                    message: "Too many requests"
                }
            }
        });

        const { result } = setupHook({
            value: "Central Park"
        });

        await flushDebounce();

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.autocompleteState.error).toBe("Location search is temporarily limited. Please try again later.");
    });

    it("should expose generic error when backend search fails", async () => {
        searchLocations.mockRejectedValue(new Error("Network error"));

        const { result } = setupHook({
            value: "Central Park"
        });

        await flushDebounce();

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.autocompleteState.error).toBe("Location suggestions could not be loaded");
    });

    /* =============================
       SELECTION
    ============================= */

    it("should select suggestion and close dropdown", async () => {
        const { result, onSelectLocation } = setupHook();

        await flushDebounce();

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.autocompleteState.suggestions.length).toBe(2);

        act(() => {
            result.current.autocompleteActions.selectSuggestion(locationSuggestions[0]);
        });

        expect(onSelectLocation).toHaveBeenCalledWith(locationSuggestions[0]);
        expect(result.current.autocompleteState.isOpen).toBe(false);
        expect(result.current.autocompleteState.highlightedIndex).toBe(-1);
    });

    it("should ignore empty suggestion selection", () => {
        const { result, onSelectLocation } = setupHook();

        act(() => {
            result.current.autocompleteActions.selectSuggestion(null);
        });

        expect(onSelectLocation).not.toHaveBeenCalled();
    });

    /* =============================
       KEYBOARD NAVIGATION
    ============================= */

    it("should move highlight down with ArrowDown", async () => {
        const { result } = setupHook();

        await flushDebounce();

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.autocompleteState.highlightedIndex).toBe(0);

        const event = {
            key: "ArrowDown",
            preventDefault: vi.fn()
        };

        act(() => {
            result.current.autocompleteActions.handleKeyDown(event);
        });

        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(result.current.autocompleteState.highlightedIndex).toBe(1);
    });

    it("should move highlight up with ArrowUp", async () => {
        const { result } = setupHook();

        await flushDebounce();

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.autocompleteState.highlightedIndex).toBe(0);

        const event = {
            key: "ArrowUp",
            preventDefault: vi.fn()
        };

        act(() => {
            result.current.autocompleteActions.handleKeyDown(event);
        });

        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(result.current.autocompleteState.highlightedIndex).toBe(1);
    });

    it("should select highlighted suggestion with Enter", async () => {
        const { result, onSelectLocation } = setupHook();

        await flushDebounce();

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.autocompleteState.highlightedIndex).toBe(0);

        const event = {
            key: "Enter",
            preventDefault: vi.fn()
        };

        act(() => {
            result.current.autocompleteActions.handleKeyDown(event);
        });

        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(onSelectLocation).toHaveBeenCalledWith(locationSuggestions[0]);
    });

    it("should ignore Enter when no suggestion is highlighted", () => {
        const { result, onSelectLocation } = setupHook({
            value: "C"
        });

        act(() => {
            result.current.autocompleteActions.handleKeyDown({
                key: "Enter",
                preventDefault: vi.fn()
            });
        });

        expect(onSelectLocation).not.toHaveBeenCalled();
    });

    it("should close dropdown with Escape", async () => {
        const { result } = setupHook();

        await flushDebounce();

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.autocompleteState.highlightedIndex).toBe(0);

        act(() => {
            result.current.autocompleteActions.handleKeyDown({
                key: "Escape",
                preventDefault: vi.fn()
            });
        });

        expect(result.current.autocompleteState.isOpen).toBe(false);
        expect(result.current.autocompleteState.highlightedIndex).toBe(-1);
    });

    it("should ignore keyboard navigation when dropdown is closed", () => {
        const { result } = setupHook({
            value: "C"
        });

        const event = {
            key: "ArrowDown",
            preventDefault: vi.fn()
        };

        act(() => {
            result.current.autocompleteActions.handleKeyDown(event);
        });

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(result.current.autocompleteState.highlightedIndex).toBe(-1);
    });

    it("should loop highlight to first suggestion with ArrowDown", async () => {
        const { result } = setupHook();

        await flushDebounce();

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.autocompleteState.highlightedIndex).toBe(0);

        act(() => {
            result.current.autocompleteActions.handleKeyDown({
                key: "ArrowDown",
                preventDefault: vi.fn()
            });
        });

        act(() => {
            result.current.autocompleteActions.handleKeyDown({
                key: "ArrowDown",
                preventDefault: vi.fn()
            });
        });

        expect(result.current.autocompleteState.highlightedIndex).toBe(0);
    });

    it("should loop highlight back to first suggestion after last suggestion", async () => {
        const { result } = setupHook();

        await flushDebounce();

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.autocompleteState.highlightedIndex).toBe(0);

        act(() => {
            result.current.autocompleteActions.handleKeyDown({
                key: "ArrowDown",
                preventDefault: vi.fn()
            });
        });

        expect(result.current.autocompleteState.highlightedIndex).toBe(1);

        act(() => {
            result.current.autocompleteActions.handleKeyDown({
                key: "ArrowDown",
                preventDefault: vi.fn()
            });
        });

        expect(result.current.autocompleteState.highlightedIndex).toBe(0);
    });

    /* =============================
       STALE REQUESTS
    ============================= */

    it("should ignore stale request results after rerender", async () => {
        let resolveFirstSearch;

        searchLocations.mockReturnValueOnce(
            new Promise((resolve) => {
                resolveFirstSearch = resolve;
            })
        );

        const { result, rerender } = setupHook({
            value: "Central"
        });

        await flushDebounce();

        rerender({
            value: "Central Park",
            onSelectLocation: vi.fn(),
            debounceDelay: 500,
            minQueryLength: 2
        });

        searchLocations.mockResolvedValueOnce({
            locations: [locationSuggestions[1]]
        });

        await flushDebounce();

        await act(async () => {
            resolveFirstSearch({
                locations: [locationSuggestions[0]]
            });
        });

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.autocompleteState.suggestions).toEqual([
            locationSuggestions[1]
        ]);
    });
});
