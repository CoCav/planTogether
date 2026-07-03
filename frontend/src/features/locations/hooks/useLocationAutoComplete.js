import { useEffect, useRef, useState } from "react";

import { normalizeApiError } from "../../../api/apiError";
import { searchLocations } from "../../../api/locations/locationApi";

/* ==================================================
   USE LOCATION AUTOCOMPLETE
   Manages location search suggestions for event forms

   Handles:
   - debounced backend location search
   - suggestion state
   - loading state
   - error state
   - no-results state
   - highlighted suggestion state
   - keyboard navigation
   - suggestion selection
   - click outside dropdown closing
   - stale request cancellation

   Notes:
   - backend search uses cached locations before provider lookup
   - dropdown opens after successful searches and user-facing errors
   - selected suggestion is owned by the parent form
================================================== */

export default function useLocationAutoComplete({
    value,
    onSelectLocation,
    debounceDelay = 350,
    minQueryLength = 2
}) {

    /* =============================
       STATE
    ============================= */

    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    /* =============================
       REFS
    ============================= */

    const containerRef = useRef(null);

    /* =============================
       SEARCH
    ============================= */

    useEffect(() => {
        let isCancelled = false;

        const cleanValue = String(value ?? "").trim();

        // Reset autocomplete when query is too short
        if (cleanValue.length < minQueryLength) {
            setSuggestions([]);
            setError("");
            setIsLoading(false);
            setIsOpen(false);
            setHighlightedIndex(-1);
            return;
        }

        const loadSuggestions = async () => {
            try {
                setIsLoading(true);
                setError("");

                // Search matching locations through the backend
                const data = await searchLocations(cleanValue);

                if (isCancelled) return;

                const nextSuggestions = data.locations ?? [];

                setSuggestions(nextSuggestions);
                setIsOpen(true);
                setHighlightedIndex(nextSuggestions.length > 0 ? 0 : -1);

            } catch (error) {
                if (isCancelled) return;

                const apiError = normalizeApiError(error);

                setSuggestions([]);
                setHighlightedIndex(-1);
                setIsOpen(true);

                if (apiError.status === 404) {
                    setError("No matching location found");
                    return;
                }

                if (apiError.status === 429) {
                    setError("Location search is temporarily limited. Please try again later.");
                    return;
                }

                setError("Location suggestions could not be loaded");

            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        // Debounce requests while the user types
        const timeoutId = setTimeout(() => {
            loadSuggestions();
        }, debounceDelay);

        return () => {
            isCancelled = true;
            clearTimeout(timeoutId);
        };

    }, [value, debounceDelay, minQueryLength]);

    /* =============================
       SELECTION
    ============================= */

    // Selects a suggestion and closes the autocomplete
    const selectSuggestion = (suggestion) => {
        if (!suggestion) return;

        onSelectLocation(suggestion);

        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    /* =============================
       KEYBOARD NAVIGATION
    ============================= */

    // Handles keyboard navigation inside the autocomplete input
    const handleKeyDown = (event) => {
        if (!isOpen) return;

        if (event.key === "ArrowDown") {
            event.preventDefault();

            setHighlightedIndex((prev) => {
                if (suggestions.length === 0) return -1;
                return prev >= suggestions.length - 1 ? 0 : prev + 1;
            });
        }

        if (event.key === "ArrowUp") {
            event.preventDefault();

            setHighlightedIndex((prev) => {
                if (suggestions.length === 0) return -1;
                return prev <= 0 ? suggestions.length - 1 : prev - 1;
            });
        }

        if (event.key === "Enter") {
            if (highlightedIndex < 0) return;

            event.preventDefault();
            selectSuggestion(suggestions[highlightedIndex]);
        }

        if (event.key === "Escape") {
            setIsOpen(false);
            setHighlightedIndex(-1);
        }
    };

    /* =============================
       CLICK OUTSIDE
    ============================= */

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!containerRef.current) return;

            if (!containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return {
        autoCompleteState: {
            suggestions,
            isLoading,
            error,
            isOpen,
            highlightedIndex
        },

        autoCompleteRefs: {
            containerRef
        },

        autoCompleteActions: {
            setIsOpen,
            setHighlightedIndex,
            selectSuggestion,
            handleKeyDown
        }
    };
}
