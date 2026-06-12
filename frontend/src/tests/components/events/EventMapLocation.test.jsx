import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import EventLocationMap from "../../../components/events/EventLocationMap";

import useEventMapLocation from "../../../features/events/hooks/form/useEventMapLocation";

/* ==================================================
   EVENT LOCATION MAP TESTS
   Tests event location map rendering states

   Handles:
   - missing location empty state
   - loading state
   - failed geocoding empty state
   - successful map rendering
   - marker popup location display

   Notes:
   - mocks useEventMapLocation to focus on component rendering
   - mocks React Leaflet components to avoid real map rendering in tests
================================================== */

vi.mock("../../../features/events/hooks/form/useEventMapLocation", () => ({
    default: vi.fn()
}));

vi.mock("react-leaflet", () => ({
    MapContainer: ({ children, center, zoom, scrollWheelZoom, className }) => (
        <div
            data-testid="map-container"
            data-center={JSON.stringify(center)}
            data-zoom={zoom}
            data-scroll-wheel-zoom={String(scrollWheelZoom)}
            className={className}
        >
            {children}
        </div>
    ),
    TileLayer: ({ url, attribution }) => (
        <div
            data-testid="tile-layer"
            data-url={url}
            data-attribution={attribution}
        />
    ),
    Marker: ({ children, position }) => (
        <div
            data-testid="map-marker"
            data-position={JSON.stringify(position)}
        >
            {children}
        </div>
    ),
    Popup: ({ children }) => (
        <div data-testid="map-popup">
            {children}
        </div>
    )
}));

describe("EventLocationMap", () => {

    /* =============================
       TEST SETUP
    ============================= */

    const mockLocationState = (state = {}) => {
        useEventMapLocation.mockReturnValue({
            coordinates: null,
            isLoading: false,
            error: "",
            ...state
        });
    };

    /* =============================
       EMPTY STATES
    ============================= */

    it("should render missing location empty state when no location is provided", () => {
        mockLocationState();

        render(<EventLocationMap location="" />);

        expect(screen.getByText("No location available")).toBeInTheDocument();
        expect(screen.getByText("This event does not have a physical location.")).toBeInTheDocument();

        expect(screen.queryByTestId("map-container")).not.toBeInTheDocument();
    });

    it("should render unavailable empty state when geocoding fails", () => {
        mockLocationState({
            error: "Location could not be loaded"
        });

        render(<EventLocationMap location="Montréal" />);

        expect(screen.getByText("Map unavailable")).toBeInTheDocument();
        expect(screen.getByText("Location could not be loaded")).toBeInTheDocument();

        expect(screen.queryByTestId("map-container")).not.toBeInTheDocument();
    });

    it("should render unavailable empty state when coordinates are missing", () => {
        mockLocationState({
            coordinates: null
        });

        render(<EventLocationMap location="Montréal" />);

        expect(screen.getByText("Map unavailable")).toBeInTheDocument();

        expect(screen.queryByTestId("map-container")).not.toBeInTheDocument();
    });

    /* =============================
       LOADING STATE
    ============================= */

    it("should render loading state while location is loading", () => {
        mockLocationState({
            isLoading: true
        });

        render(<EventLocationMap location="Montréal" />);

        expect(screen.getByRole("status")).toHaveTextContent("Loading map...");
        expect(screen.getByText("Finding this event location.")).toBeInTheDocument();

        expect(screen.queryByTestId("map-container")).not.toBeInTheDocument();
    });

    /* =============================
       MAP RENDERING
    ============================= */

    it("should render map when coordinates are available", () => {
        mockLocationState({
            coordinates: {
                lat: 45.5017,
                lng: -73.5673,
                label: "Montréal, Québec, Canada"
            }
        });

        render(<EventLocationMap location="Montréal" />);

        expect(screen.getByTestId("map-container")).toHaveAttribute(
            "data-center",
            JSON.stringify([45.5017, -73.5673])
        );

        expect(screen.getByTestId("map-container")).toHaveAttribute("data-zoom", "13");
        expect(screen.getByTestId("map-container")).toHaveAttribute("data-scroll-wheel-zoom", "false");
        expect(screen.getByTestId("map-container")).toHaveClass("event-location-map-canvas");

        expect(screen.getByTestId("tile-layer")).toHaveAttribute(
            "data-url",
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        );

        expect(screen.getByTestId("map-marker")).toHaveAttribute(
            "data-position",
            JSON.stringify([45.5017, -73.5673])
        );

        expect(screen.getByTestId("map-popup")).toHaveTextContent("Montréal, Québec, Canada");
    });

    it("should call useEventMapLocation with the provided location", () => {
        mockLocationState({
            coordinates: {
                lat: 45.5017,
                lng: -73.5673,
                label: "Montréal, Québec, Canada"
            }
        });

        render(<EventLocationMap location="Montréal" />);

        expect(useEventMapLocation).toHaveBeenCalledWith("Montréal");
    });
});
