import { useEffect, useState } from "react";

import { normalizeApiError } from "../../../../api/apiError";
import { searchLocations } from "../../../../api/locations/locationApi";

/* ==================================================
   USE EVENT MAP LOCATION
   Converts a location text into map coordinates

   Handles:
   - backend location search
   - cached/provider geocoding through API
   - loading state
   - error state
   - empty location fallback
   - request cancellation on unmount
   - rate limit and not found errors
================================================== */

export default function useEventMapLocation(location) {

    /* =============================
       STATE
    ============================= */

    const [coordinates, setCoordinates] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    /* =============================
       LOCATION SEARCH
    ============================= */

    useEffect(() => {

        // Prevents state updates after component unmount
        let isCancelled = false;

        const cleanLocation = String(location ?? "").trim();

        // Reset state when location is empty
        if (!cleanLocation) {
            setCoordinates(null);
            setError("");
            setIsLoading(false);
            return;
        }

        const loadLocation = async () => {
            try {
                setIsLoading(true);
                setError("");

                // Search locations through backend API
                const data = await searchLocations(cleanLocation);

                if (isCancelled) return;

                // Uses the best matching location result
                const locationResult = data.locations?.[0];

                if (!locationResult) {
                    setCoordinates(null);
                    setError("Location could not be found");
                    return;
                }

                // Normalize backend coordinates for Leaflet map usage
                setCoordinates({
                    lat: Number(locationResult.latitude),
                    lng: Number(locationResult.longitude),
                    label: locationResult.label ?? cleanLocation
                });

            } catch (error) {
                if (isCancelled) return;

                const apiError = normalizeApiError(error);

                setCoordinates(null);

                // Backend/provider temporary rate limit
                if (apiError.status === 429) {
                    setError("Location search is temporarily limited. Please try again later.");
                    return;
                }

                // No matching location found
                if (apiError.status === 404) {
                    setError("Location could not be found");
                    return;
                }

                // Generic location loading failure
                setError("Location could not be loaded");

            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        // Wait before searching to avoid one API call per typed character
        const timeoutId = setTimeout(() => {
            loadLocation();
        }, 600);

        return () => {
            isCancelled = true;
            clearTimeout(timeoutId);
        };

    }, [location]);

    return {
        coordinates,
        isLoading,
        error
    };
}
