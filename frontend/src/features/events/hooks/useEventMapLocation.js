import { useEffect, useState } from "react";

/* ==================================================
   USE EVENT MAP LOCATION
   Converts a location text into map coordinates

   Handles:
   - location geocoding with OpenStreetMap Nominatim
   - loading state
   - error state
   - empty location fallback
   - request cancellation on unmount
================================================== */

export default function useEventMapLocation(location) {

    /* =============================
       STATE
    ============================= */

    const [coordinates, setCoordinates] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    /* =============================
       GEOCODING
    ============================= */

    useEffect(() => {
        const cleanLocation = String(location ?? "").trim();

        if (!cleanLocation) {
            setCoordinates(null);
            setError("");
            setIsLoading(false);
            return;
        }

        const controller = new AbortController();

        const geocodeLocation = async () => {
            try {
                setIsLoading(true);
                setError("");

                const params = new URLSearchParams({
                    q: cleanLocation,
                    format: "json",
                    limit: "1"
                });

                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
                    {
                        signal: controller.signal,
                        headers: {
                            Accept: "application/json"
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error("Unable to find this location");
                }

                const results = await response.json();

                if (!Array.isArray(results) || results.length === 0) {
                    setCoordinates(null);
                    setError("Location could not be found");
                    return;
                }

                setCoordinates({
                    lat: Number(results[0].lat),
                    lng: Number(results[0].lon),
                    label: results[0].display_name ?? cleanLocation
                });

            } catch (error) {
                if (error.name === "AbortError") return;

                setCoordinates(null);
                setError("Location could not be loaded");

            } finally {
                setIsLoading(false);
            }
        };

        geocodeLocation();

        return () => {
            controller.abort();
        };
    }, [location]);

    return {
        coordinates,
        isLoading,
        error
    };
}
