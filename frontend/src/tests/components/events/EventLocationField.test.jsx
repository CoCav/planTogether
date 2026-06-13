import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventLocationField from "../../../components/events/EventLocationField";

import useLocationAutocomplete from "../../../features/events/hooks/form/useLocationAutocomplete";

/* ==================================================
   EVENT LOCATION FIELD TESTS
   Tests location autocomplete field rendering

   Handles:
   - input rendering
   - autocomplete dropdown rendering
   - loading state rendering
   - error state rendering
   - suggestion rendering
   - highlighted suggestion styling
   - suggestion selection
   - accessible combobox attributes

   Ensures:
   - location autocomplete UI stays predictable
   - selected suggestions are delegated to the autocomplete hook
   - provider labels are formatted before display
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
        placeholder: "Enter a location",
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

    it("should call hook with value and onSelectLocation", () => {
        renderComponent({
            props: {
                value: "Montreal"
            }
        });

        expect(useLocationAutocomplete).toHaveBeenCalledWith({
            value: "Montreal",
            onSelectLocation: defaultProps.onSelectLocation
        });
    });

    it("should call onChange when typing", () => {
        renderComponent();

        fireEvent.change(screen.getByRole("combobox"), {
            target: {
                name: "location",
                value: "Montreal"
            }
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

    it("should render formatted suggestions", () => {
        renderComponent({
            hookState: {
                autocompleteState: {
                    isOpen: true,
                    suggestions: [
                        {
                            label: "Musée d'art contemporain de Montréal, Ville-Marie, Montréal, Québec, Canada",
                            latitude: 45.5076,
                            longitude: -73.5661,
                            provider: "nominatim"
                        }
                    ]
                }
            }
        });

        expect(
            screen.getByRole("option", {
                name: "Musée d'art contemporain de Montréal • Québec, Canada"
            })
        ).toBeInTheDocument();
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
});
