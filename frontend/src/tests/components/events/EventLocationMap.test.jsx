import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import EventLocationMap from "../../../components/events/EventLocationMap";
import useEventMapLocation from "../../../features/events/hooks/form/useEventMapLocation";

/* ==================================================
   EVENT LOCATION MAP TESTS
   Tests event location map rendering states

   Handles:
   - empty location state
   - loading state
   - error state
   - map rendering
   - selected location bypassing API
   - popup content rendering

   Notes:
   - react-leaflet is mocked to avoid DOM complexity
   - hook is fully mocked for deterministic tests
================================================== */

vi.mock("../../../features/events/hooks/form/useEventMapLocation", () => ({
    default: vi.fn()
}));

vi.mock("react-leaflet", () => ({
    MapContainer: ({ children, center, zoom, className }) => (
        <div
            data-testid="map-container"
            data-center={JSON.stringify(center)}
            data-zoom={zoom}
            className={className}
        >
            {children}
        </div>
    ),
    TileLayer: ({ url }) => (
        <div data-testid="tile-layer" data-url={url} />
    ),
    Marker: ({ children, position }) => (
        <div data-testid="map-marker" data-position={JSON.stringify(position)}>
            {children}
        </div>
    ),
    Popup: ({ children }) => (
        <div data-testid="map-popup">{children}</div>
    )
}));

describe("EventLocationMap", () => {

    const mockHook = (state = {}) => {
        useEventMapLocation.mockReturnValue({
            coordinates: null,
            isLoading: false,
            error: "",
            ...state
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       EMPTY STATES
    ============================= */

    it("should render empty state when no location is provided", () => {
        mockHook();

        render(<EventLocationMap location="" />);

        expect(screen.getByText("No location available")).toBeInTheDocument();
        expect(
            screen.getByText("This event does not have a physical location.")
        ).toBeInTheDocument();

        expect(screen.queryByTestId("map-container")).not.toBeInTheDocument();
    });

    it("should render error state when geocoding fails", () => {
        mockHook({
            error: "Location could not be loaded"
        });

        render(<EventLocationMap location="Montréal" />);

        expect(screen.getByText("Map unavailable")).toBeInTheDocument();
        expect(screen.getByText("Location could not be loaded")).toBeInTheDocument();
    });

    it("should render error state when no coordinates returned", () => {
        mockHook({
            coordinates: null
        });

        render(<EventLocationMap location="Montréal" />);

        expect(screen.getByText("Map unavailable")).toBeInTheDocument();
    });

    /* =============================
       LOADING STATE
    ============================= */

    it("should show loading state while fetching coordinates", () => {
        mockHook({
            isLoading: true
        });

        render(<EventLocationMap location="Montréal" />);

        expect(screen.getByText("Loading map...")).toBeInTheDocument();
        expect(screen.getByText("Finding this event location.")).toBeInTheDocument();

        expect(screen.queryByTestId("map-container")).not.toBeInTheDocument();
    });

    /* =============================
       MAP RENDERING
    ============================= */

    it("should render map with coordinates from API", () => {
        mockHook({
            coordinates: {
                lat: 45.5017,
                lng: -73.5673,
                label: "Agora du Vieux-Port, Québec"
            }
        });

        render(
            <EventLocationMap
                eventTitle="Rock Concert"
                location="Montréal"
            />
        );

        expect(screen.getByTestId("map-container")).toHaveAttribute(
            "data-center",
            JSON.stringify([45.5017, -73.5673])
        );

        expect(screen.getByTestId("map-marker")).toHaveAttribute(
            "data-position",
            JSON.stringify([45.5017, -73.5673])
        );

        expect(screen.getByTestId("map-popup")).toHaveTextContent("Rock Concert");
        expect(screen.getByTestId("map-popup")).toHaveTextContent("Agora du Vieux-Port");
    });

    /* =============================
       API CALL
    ============================= */

    it("should call hook with location string", () => {
        mockHook({
            coordinates: {
                lat: 1,
                lng: 1,
                label: "test"
            }
        });

        render(<EventLocationMap location="Montréal" />);

        expect(useEventMapLocation).toHaveBeenCalledWith("Montréal");
    });

    /* =============================
       SELECTED LOCATION OVERRIDE
    ============================= */

    it("should use selectedLocation instead of API", () => {
        mockHook();

        render(
            <EventLocationMap
                eventTitle="Test Event"
                selectedLocation={{
                    label: "Central Park",
                    latitude: 40.7,
                    longitude: -73.9,
                    provider: "nominatim"
                }}
            />
        );

        expect(useEventMapLocation).toHaveBeenCalledWith("");

        expect(screen.getByTestId("map-container")).toHaveAttribute(
            "data-center",
            JSON.stringify([40.7, -73.9])
        );

        expect(screen.getByTestId("map-marker")).toHaveAttribute(
            "data-position",
            JSON.stringify([40.7, -73.9])
        );
    });

    it("should ignore loading when selectedLocation is provided", () => {
        mockHook({
            isLoading: true
        });

        render(
            <EventLocationMap
                selectedLocation={{
                    label: "Central Park",
                    latitude: 40.7,
                    longitude: -73.9
                }}
            />
        );

        expect(screen.getByTestId("map-container")).toBeInTheDocument();
        expect(screen.queryByText("Loading map...")).not.toBeInTheDocument();
    });
});
