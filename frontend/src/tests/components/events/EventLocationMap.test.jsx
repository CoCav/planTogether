import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventLocationMap from "../../../components/events/EventLocationMap";
import useEventMapLocation from "../../../features/events/hooks/form/useEventMapLocation";

/* ==================================================
   EVENT LOCATION MAP TESTS
   Tests event location map rendering and actions

   Handles:
   - missing location state
   - loading state before/while searching
   - failed geocoding state
   - map rendering with backend coordinates
   - selected location rendering without backend lookup
   - public/private location lookup option
   - popup title and address display
   - external map and directions links
   - copy address feedback

   Notes:
   - react-leaflet is mocked to avoid real map rendering
   - useEventMapLocation is mocked for deterministic states
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

    const mockHook = (state = {}) => {
        useEventMapLocation.mockReturnValue({
            coordinates: null,
            hasSearched: true,
            isLoading: false,
            error: "",
            ...state
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();

        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn()
            }
        });
    });

    /* =============================
       EMPTY STATES
    ============================= */

    it("should render empty state when no location is provided", () => {
        mockHook();

        render(<EventLocationMap location="" />);

        expect(screen.getByText("No location available")).toBeInTheDocument();
        expect(screen.getByText("This event does not have a physical location.")).toBeInTheDocument();

        expect(screen.queryByTestId("map-container")).not.toBeInTheDocument();
    });

    it("should render loading state before search has completed", () => {
        mockHook({
            hasSearched: false,
            isLoading: false
        });

        render(<EventLocationMap location="Montréal" />);

        expect(screen.getByText("Loading map...")).toBeInTheDocument();
        expect(screen.getByText("Finding this event location.")).toBeInTheDocument();

        expect(screen.queryByTestId("map-container")).not.toBeInTheDocument();
    });

    it("should render loading state while fetching coordinates", () => {
        mockHook({
            hasSearched: false,
            isLoading: true
        });

        render(<EventLocationMap location="Montréal" />);

        expect(screen.getByText("Loading map...")).toBeInTheDocument();
        expect(screen.getByText("Finding this event location.")).toBeInTheDocument();

        expect(screen.queryByTestId("map-container")).not.toBeInTheDocument();
    });

    it("should render error state when geocoding fails after search", () => {
        mockHook({
            hasSearched: true,
            error: "Location could not be loaded"
        });

        render(<EventLocationMap location="Montréal" />);

        expect(screen.getByText("Map unavailable")).toBeInTheDocument();
        expect(screen.getByText("Location could not be loaded")).toBeInTheDocument();

        expect(screen.queryByTestId("map-container")).not.toBeInTheDocument();
    });

    it("should render error state when no coordinates are returned after search", () => {
        mockHook({
            hasSearched: true,
            coordinates: null
        });

        render(<EventLocationMap location="Montréal" />);

        expect(screen.getByText("Map unavailable")).toBeInTheDocument();
        expect(screen.queryByTestId("map-container")).not.toBeInTheDocument();
    });

    /* =============================
       MAP RENDERING
    ============================= */

    it("should render map with coordinates from backend search", () => {
        mockHook({
            hasSearched: true,
            coordinates: {
                lat: 45.5017,
                lng: -73.5673,
                label: "Agora du Vieux-Port, Rue de Quercy, Québec, G1K 4B9, Canada"
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

        expect(screen.getByTestId("map-container")).toHaveAttribute("data-zoom", "13");
        expect(screen.getByTestId("map-container")).toHaveAttribute("data-scroll-wheel-zoom", "false");

        expect(screen.getByTestId("map-marker")).toHaveAttribute(
            "data-position",
            JSON.stringify([45.5017, -73.5673])
        );

        expect(screen.getByTestId("map-popup")).toHaveTextContent("Rock Concert");
        expect(screen.getByTestId("map-popup")).toHaveTextContent("Agora du Vieux-Port");
        expect(screen.getByTestId("map-popup")).toHaveTextContent("Rue de Quercy");
        expect(screen.getByTestId("map-popup")).toHaveTextContent("Québec, G1K 4B9, Canada");
    });

    it("should call hook with location and public option", () => {
        mockHook({
            hasSearched: true,
            coordinates: {
                lat: 1,
                lng: 1,
                label: "Test location"
            }
        });

        render(
            <EventLocationMap
                location="Montréal"
                isPublic
            />
        );

        expect(useEventMapLocation).toHaveBeenCalledWith(
            "Montréal",
            { isPublic: true }
        );
    });

    /* =============================
       SELECTED LOCATION
    ============================= */

    it("should use selectedLocation instead of backend coordinates", () => {
        mockHook({
            hasSearched: false,
            isLoading: true
        });

        render(
            <EventLocationMap
                eventTitle="Test Event"
                selectedLocation={{
                    label: "Central Park, New York, USA",
                    latitude: 40.7,
                    longitude: -73.9,
                    provider: "nominatim"
                }}
            />
        );

        expect(useEventMapLocation).toHaveBeenCalledWith(
            "",
            { isPublic: false }
        );

        expect(screen.getByTestId("map-container")).toHaveAttribute(
            "data-center",
            JSON.stringify([40.7, -73.9])
        );

        expect(screen.getByTestId("map-marker")).toHaveAttribute(
            "data-position",
            JSON.stringify([40.7, -73.9])
        );

        expect(screen.queryByText("Loading map...")).not.toBeInTheDocument();
    });

    /* =============================
       POPUP ACTIONS
    ============================= */

    it("should render Google Maps and directions links", () => {
        mockHook({
            hasSearched: true,
            coordinates: {
                lat: 45.5017,
                lng: -73.5673,
                label: "Montréal, Québec, Canada"
            }
        });

        render(<EventLocationMap location="Montréal" />);

        expect(screen.getByRole("link", {
            name: "Open Montréal, Québec, Canada in Google Maps (opens new tab)"
        })).toHaveAttribute(
            "href",
            "https://www.google.com/maps?q=45.5017,-73.5673"
        );

        expect(screen.getByRole("link", {
            name: "Get directions to Montréal, Québec, Canada (opens new tab)"
        })).toHaveAttribute(
            "href",
            "https://www.google.com/maps/dir/?api=1&destination=45.5017,-73.5673"
        );
    });

    it("should copy address to clipboard", () => {
        mockHook({
            hasSearched: true,
            coordinates: {
                lat: 45.5017,
                lng: -73.5673,
                label: "Montréal, Québec, Canada"
            }
        });

        render(<EventLocationMap location="Montréal" />);

        fireEvent.click(screen.getByRole("button", {
            name: "Copy address to clipboard"
        }));

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Montréal, Québec, Canada");

        expect(screen.getByText("Copied")).toBeInTheDocument();
    });
});
