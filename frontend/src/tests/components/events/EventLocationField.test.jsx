import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventLocationField from "../../../components/events/EventLocationField";
import useLocationAutocomplete from "../../../features/events/hooks/form/useLocationAutocomplete";

/* ==================================================
   EVENT LOCATION FIELD TESTS
   Tests location autocomplete field rendering

   Handles:
   - combobox input rendering
   - autocomplete hook integration
   - dropdown visibility states
   - loading state rendering
   - error state rendering
   - formatted suggestion rendering
   - highlighted suggestion state
   - suggestion selection
   - keyboard navigation forwarding
   - accessible combobox relationships

   Notes:
   - mocks autocomplete hook
   - ensures UI stays predictable and accessible
================================================== */

vi.mock("../../../features/events/hooks/form/useLocationAutocomplete", () => ({
    default: vi.fn()
}));

describe("EventLocationField", () => {

    const defaultHookState = {
        autocompleteState: {
            suggestions: [],
            isLoading: false,
            error: "",
            isOpen: false,
            highlightedIndex: -1
        },
        autocompleteRefs: {
            containerRef: { current: null }
        },
        autocompleteActions: {
            setIsOpen: vi.fn(),
            selectSuggestion: vi.fn(),
            handleKeyDown: vi.fn()
        }
    };

    const defaultProps = {
        id: "location",
        name: "location",
        value: "",
        error: "",
        placeholder: "Search for a city, venue or address",
        ariaDescribedBy: undefined,
        onChange: vi.fn(),
        onSelectLocation: vi.fn()
    };

    const renderComponent = ({
        props = {},
        hookState = {}
    } = {}) => {
        useLocationAutocomplete.mockReturnValue({
            ...defaultHookState,
            ...hookState,
            autocompleteState: {
                ...defaultHookState.autocompleteState,
                ...(hookState.autocompleteState || {})
            },
            autocompleteRefs: {
                ...defaultHookState.autocompleteRefs,
                ...(hookState.autocompleteRefs || {})
            },
            autocompleteActions: {
                ...defaultHookState.autocompleteActions,
                ...(hookState.autocompleteActions || {})
            }
        });

        return render(
            <EventLocationField
                {...defaultProps}
                {...props}
            />
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       INPUT
    ============================= */

    it("should render location input", () => {
        renderComponent();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should expose accessible combobox attributes", () => {
        renderComponent({
            hookState: {
                autocompleteState: {
                    isOpen: true,
                    suggestions: [
                        {
                            label: "Montréal, Québec, Canada",
                            latitude: 45.5017,
                            longitude: -73.5673,
                            provider: "nominatim"
                        }
                    ]
                }
            }
        });

        const input = screen.getByRole("combobox");

        expect(input).toHaveAttribute("aria-autocomplete", "list");
        expect(input).toHaveAttribute("aria-expanded", "true");
        expect(input).toHaveAttribute("aria-controls", "location-suggestions");
        expect(input).toHaveAttribute("autocomplete", "off");
    });

    it("should expose active descendant when a suggestion is highlighted", () => {
        renderComponent({
            hookState: {
                autocompleteState: {
                    isOpen: true,
                    highlightedIndex: 0,
                    suggestions: [
                        {
                            label: "Montréal, Québec, Canada",
                            latitude: 45.5017,
                            longitude: -73.5673,
                            provider: "nominatim"
                        }
                    ]
                }
            }
        });

        const input = screen.getByRole("combobox");
        const option = screen.getByRole("option");

        expect(input).toHaveAttribute("aria-activedescendant", option.id);
    });

    it("should render city, venue or address placeholder", () => {
        renderComponent();

        expect(screen.getByPlaceholderText(/search for a city, venue or address/i)).toBeInTheDocument();
    });

    it("should call hook with value and onSelectLocation", () => {
        renderComponent({
            props: { value: "Montreal" }
        });

        expect(useLocationAutocomplete).toHaveBeenCalledWith({
            value: "Montreal",
            onSelectLocation: defaultProps.onSelectLocation
        });
    });

    it("should call onChange when typing", () => {
        renderComponent();

        fireEvent.change(screen.getByRole("combobox"), {
            target: { name: "location", value: "Montreal" }
        });

        expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
    });

    it("should call handleKeyDown when pressing keyboard keys", () => {
        const handleKeyDown = vi.fn();

        renderComponent({
            hookState: {
                autocompleteActions: {
                    handleKeyDown
                }
            }
        });

        fireEvent.keyDown(screen.getByRole("combobox"), {
            key: "ArrowDown"
        });

        expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    it("should call handleKeyDown for Escape key", () => {
        const handleKeyDown = vi.fn();

        renderComponent({
            hookState: {
                autocompleteActions: {
                    handleKeyDown
                }
            }
        });

        fireEvent.keyDown(screen.getByRole("combobox"), {
            key: "Escape"
        });

        expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    /* =============================
       DROPDOWN STATES
    ============================= */

    it("should render loading dropdown state", () => {
        renderComponent({
            hookState: {
                autocompleteState: {
                    isOpen: true,
                    isLoading: true
                }
            }
        });

        expect(screen.getByText("Searching locations...")).toBeInTheDocument();
    });

    it("should render error dropdown state", () => {
        renderComponent({
            hookState: {
                autocompleteState: {
                    isOpen: true,
                    error: "No matching location found"
                }
            }
        });

        expect(screen.getByText("No matching location found")).toBeInTheDocument();
    });

    it("should render formatted inline location suggestions", () => {
        renderComponent({
            hookState: {
                autocompleteState: {
                    isOpen: true,
                    suggestions: [
                        {
                            label: "Agora du Vieux-Port, Rue de Quercy, Québec, G1K 4B9, Canada",
                            latitude: 46.8176,
                            longitude: -71.2004,
                            provider: "nominatim"
                        }
                    ]
                }
            }
        });

        expect(screen.getByRole("option")).toHaveTextContent("Agora du Vieux-Port");
    });

    it("should mark highlighted suggestion as selected", () => {
        renderComponent({
            hookState: {
                autocompleteState: {
                    isOpen: true,
                    highlightedIndex: 0,
                    suggestions: [
                        {
                            label: "Montréal, Québec, Canada",
                            latitude: 45.5017,
                            longitude: -73.5673,
                            provider: "nominatim"
                        }
                    ]
                }
            }
        });

        const option = screen.getByRole("option");

        expect(option).toHaveAttribute("aria-selected", "true");
        expect(option).toHaveClass("is-highlighted");
    });

    it("should select suggestion on mouse down", () => {
        const selectSuggestion = vi.fn();

        const suggestion = {
            label: "Montréal, Québec, Canada",
            latitude: 45.5017,
            longitude: -73.5673,
            provider: "nominatim"
        };

        renderComponent({
            hookState: {
                autocompleteState: {
                    isOpen: true,
                    suggestions: [suggestion]
                },
                autocompleteActions: {
                    selectSuggestion
                }
            }
        });

        fireEvent.mouseDown(screen.getByRole("option"));

        expect(selectSuggestion).toHaveBeenCalledWith(suggestion);
    });

    /* =============================
       EDGE / UX STATES
    ============================= */

    it("should not render dropdown when closed", () => {
        renderComponent();

        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });

    it("should not expose dropdown relationships when dropdown is closed", () => {
        renderComponent({
            hookState: {
                autocompleteState: {
                    isOpen: false,
                    highlightedIndex: 0,
                    suggestions: [
                        {
                            label: "Montréal, Québec, Canada",
                            latitude: 45.5017,
                            longitude: -73.5673,
                            provider: "nominatim"
                        }
                    ]
                }
            }
        });

        const input = screen.getByRole("combobox");

        expect(input).toHaveAttribute("aria-expanded", "false");
        expect(input).not.toHaveAttribute("aria-controls");
        expect(input).not.toHaveAttribute("aria-activedescendant");
    });
});
