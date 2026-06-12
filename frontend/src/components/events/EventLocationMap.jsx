import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import useEventMapLocation from "../../features/events/hooks/form/useEventMapLocation";

import EmptyState from "../ui/EmptyState";
import LoadingState from "../ui/LoadingState";

/* ==================================================
   EVENT LOCATION MAP
   Displays an event location on an interactive map

   Handles:
   - backend geocoded location rendering
   - loading state
   - missing location state
   - failed geocoding state
   - OpenStreetMap tile rendering
   - marker and popup display
   - reusable event map location rendering
================================================== */

export default function EventLocationMap({ location }) {

    /* =============================
       LOCATION DATA
    ============================= */

    const {
        coordinates,
        isLoading,
        error
    } = useEventMapLocation(location);

    /* =============================
       DISPLAY STATES
    ============================= */

    // No physical location available
    if (!location) {
        return (
            <EmptyState
                title="No location available"
                description="This event does not have a physical location."
            />
        );
    }

    // Loading backend geolocation data
    if (isLoading) {
        return (
            <LoadingState
                title="Loading map..."
                description="Finding this event location."
            />
        );
    }

    // Failed geolocation or provider error
    if (error || !coordinates) {
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
                        {coordinates.label}
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
