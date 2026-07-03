import { useEffect, useState } from "react";

import { normalizeApiError } from "../../../api/apiError";

import { searchLocations, searchPublicLocations } from "../../../api/locations/locationApi";

/* ==================================================
   USE EVENT MAP LOCATION
   Converts a location text into map coordinates

   Handles:
   - authenticated or public backend location search
   - coordinate normalization
   - structured location normalization
   - cached/provider geocoding through API
   - loading state
   - completed search tracking
   - error state
   - empty location fallback
   - request cancellation on unmount
   - rate limit and not found errors

   Notes:
   - authenticated search is used by protected app pages
   - public search is used by public event pages
   - hasSearched prevents showing "Map unavailable" before lookup finishes
================================================== */

export default function useEventMapLocation(location, options = {}) {
    const { isPublic = false } = options;

    /* =============================
       STATE
    ============================= */

    const [coordinates, setCoordinates] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    /* =============================
       LOCATION SEARCH
    ============================= */

    useEffect(() => {

        // Prevents state updates after component unmount
        let isCancelled = false;

        const cleanLocation = String(location ?? "").trim();

        // Reset map lookup state when no location is available
        if (!cleanLocation) {
            setCoordinates(null);
            setError("");
            setHasSearched(false);
            setIsLoading(false);
            return;
        }

        const loadLocation = async () => {
            try {
                setHasSearched(false);
                setIsLoading(true);
                setError("");

                // Use the public endpoint for public pages, otherwise protected search
                const data = isPublic
                    ? await searchPublicLocations(cleanLocation)
                    : await searchLocations(cleanLocation);

                if (isCancelled) return;

                // Uses the first matching location returned by the backend
                const locationResult = data.locations?.[0];

                if (!locationResult) {
                    setCoordinates(null);
                    setError("Location could not be found");
                    return;
                }

                // Normalizes backend location data for Leaflet and popup display
                setCoordinates({
                    lat: Number(locationResult.latitude),
                    lng: Number(locationResult.longitude),
                    label: locationResult.label ?? cleanLocation,
                    streetAddress: locationResult.streetAddress ?? null,
                    city: locationResult.city ?? null,
                    region: locationResult.region ?? null,
                    postalCode: locationResult.postalCode ?? null,
                    country: locationResult.country ?? null
                });

            } catch (error) {
                if (isCancelled) return;

                const apiError = normalizeApiError(error);

                setCoordinates(null);

                if (apiError.status === 429) {
                    setError("Location search is temporarily limited. Please try again later.");
                    return;
                }

                if (apiError.status === 404) {
                    setError("Location could not be found");
                    return;
                }

                // Generic location loading failure
                setError("Location could not be loaded");

            } finally {
                if (!isCancelled) {
                    setHasSearched(true);
                    setIsLoading(false);
                }
            }
        };

        // Debounce map lookup to avoid extra API calls during typing
        const timeoutId = setTimeout(() => {
            loadLocation();
        }, 600);

        return () => {
            isCancelled = true;
            clearTimeout(timeoutId);
        };

    }, [location, isPublic]);

    return {
        coordinates,
        hasSearched,
        isLoading,
        error
    };
}
