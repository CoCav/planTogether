import { useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Check, Copy, ExternalLink, Navigation } from "lucide-react";

import useEventMapLocation from "../../features/events/hooks/form/useEventMapLocation";

import { formatLocationDisplayLabel, buildGoogleMapsUrl } from "../../utils/formatters";

import EmptyState from "../ui/EmptyState";
import LoadingState from "../ui/LoadingState";

/* ==================================================
   EVENT LOCATION MAP
   Displays an event location on an interactive map

   Handles:
   - selected geocoded location rendering
   - fallback backend geocoding from location text
   - authenticated or public map lookup
   - loading and missing location states
   - failed geocoding state
   - OpenStreetMap tile rendering
   - marker and popup display
   - optional popup title display
   - formatted popup address display
   - Google Maps external link
   - directions external link
   - copy address action
   - copied feedback state
   - clipboard failure fallback

   Notes:
   - selectedLocation avoids an extra API search after autocomplete selection
   - location text fallback keeps the component reusable outside event forms
   - isPublic uses the public location endpoint for pages visible without login
================================================== */

export default function EventLocationMap({
    eventTitle = "",
    location,
    selectedLocation = null,
    isPublic = false
}) {

    /* =============================
       COPY STATE
    ============================= */

    const [copied, setCopied] = useState(false);

    /* =============================
       LOCATION DATA
    ============================= */

    const shouldSearchLocation = !selectedLocation;

    const {
        coordinates: searchedCoordinates,
        hasSearched,
        isLoading,
        error
    } = useEventMapLocation(
        shouldSearchLocation ? location : "",
        { isPublic }
    );

    /* =============================
       DERIVED LOCATION
    ============================= */

    // Prefer selected autocomplete coordinates, fallback to backend search result
    const coordinates = selectedLocation
        ? {
            lat: Number(selectedLocation.latitude),
            lng: Number(selectedLocation.longitude),
            label: selectedLocation.label
        }
        : searchedCoordinates;

    const displayLocation = selectedLocation?.label || location;

    /* =============================
       DISPLAY STATES
    ============================= */

    // No physical location available
    if (!displayLocation) {
        return (
            <EmptyState
                title="No location available"
                description="This event does not have a physical location."
            />
        );
    }

    // Avoid rendering the map before coordinates are ready
    if (shouldSearchLocation && (!hasSearched || isLoading)) {
        return (
            <LoadingState
                title="Loading map..."
                description="Finding this event location."
            />
        );
    }

    // Failed geolocation or provider error
    if (hasSearched && (error || !coordinates)) {
        return (
            <EmptyState
                title="Map unavailable"
                description={
                    error ||
                    "We could not find this event location on the map."
                }
            />
        );
    }

    /* =============================
       MAIN RENDER
    ============================= */

    return (
        <div className="event-location-map">
            <MapContainer
                center={[coordinates.lat, coordinates.lng]}
                zoom={13}
                scrollWheelZoom={false}
                className="event-location-map-canvas"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[coordinates.lat, coordinates.lng]}>
                    <Popup>
                        <div className="event-location-popup">
                            <div className="event-location-popup-header">

                                {eventTitle && (
                                    <p className="event-location-popup-title">
                                        {eventTitle}
                                    </p>
                                )}

                                <p className="event-location-popup-address">
                                    {formatLocationDisplayLabel(coordinates.label)}
                                </p>
                            </div>

                            <div className="event-location-popup-actions" role="group" aria-label="Map actions">
                                <a
                                    href={buildGoogleMapsUrl(coordinates.lat, coordinates.lng)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="popup-btn"
                                    aria-label={`Open ${coordinates.label} in Google Maps (opens new tab)`}
                                >
                                    <ExternalLink />
                                    Open in Google Maps
                                </a>

                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`}
                                    className="popup-btn secondary"
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={`Get directions to ${coordinates.label} (opens new tab)`}
                                >
                                    <Navigation />
                                    Get directions
                                </a>

                                <button
                                    type="button"
                                    className="popup-btn secondary"
                                    aria-live="polite"
                                    aria-label={copied ? "Address copied to clipboard" : "Copy address to clipboard"}
                                    onClick={async () => {
                                        try {
                                            await navigator.clipboard.writeText(coordinates.label);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 1500);
                                        } catch {
                                            setCopied(false);
                                        }
                                    }}
                                >
                                    {copied ? <Check /> : <Copy />}
                                    {copied ? "Copied" : "Copy address"}
                                </button>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
