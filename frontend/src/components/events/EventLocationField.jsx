import { MapPin } from "lucide-react";

import useLocationAutocomplete from "../../features/events/hooks/form/useLocationAutocomplete";

import { formatLocationInlineLabel } from "../../utils/formatters";

import Input from "../ui/Input";

/* ==================================================
   EVENT LOCATION FIELD
   Renders a searchable location input with backend-powered suggestions

   Handles:
   - city, venue or address search input rendering
   - debounced suggestion dropdown
   - loading dropdown state
   - error dropdown state
   - formatted suggestion rendering
   - highlighted suggestion state
   - keyboard navigation
   - click suggestion selection
   - accessible combobox attributes
   - active descendant relationship

   Notes:
   - parent form owns the final location value
   - selected suggestion is passed back to the parent form
   - map preview should use selectedLocation after selection
================================================== */

export default function EventLocationField({
    id,
    name,
    value,
    error,
    placeholder,
    ariaDescribedBy,

    onChange,
    onSelectLocation
}) {

    /* =============================
       AUTOCOMPLETE STATE
    ============================= */

    const {
        autocompleteState,
        autocompleteRefs,
        autocompleteActions
    } = useLocationAutocomplete({
        value,
        onSelectLocation
    });

    const {
        suggestions,
        isLoading,
        error: autocompleteError,
        isOpen,
        highlightedIndex
    } = autocompleteState;

    const {
        containerRef
    } = autocompleteRefs;

    const {
        setIsOpen,
        selectSuggestion,
        handleKeyDown
    } = autocompleteActions;

    /* =============================
       DERIVED VALUES
    ============================= */

    const listboxId = `${id}-suggestions`;

    const shouldShowDropdown = isOpen && (isLoading || autocompleteError || suggestions.length > 0);

    const activeOptionId =
        highlightedIndex >= 0
            ? `${listboxId}-option-${highlightedIndex}`
            : undefined;

    /* =============================
       RENDER HELPERS
    ============================= */

    // Opens existing suggestions again when input receives focus
    const handleFocus = () => {
        if (suggestions.length > 0 || autocompleteError) {
            setIsOpen(true);
        }
    };

    /* =============================
       MAIN RENDER
    ============================= */

    return (
        <div className="location-autocomplete" ref={containerRef}>
            <Input
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                error={error}
                aria-describedby={ariaDescribedBy}
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={shouldShowDropdown}
                aria-controls={shouldShowDropdown ? listboxId : undefined}
                aria-activedescendant={shouldShowDropdown ? activeOptionId : undefined}
                autoComplete="off"
            />

            {shouldShowDropdown && (
                <div
                    id={listboxId}
                    className="location-autocomplete-dropdown"
                    role="listbox"
                >
                    {isLoading && (
                        <div className="location-autocomplete-status">
                            Searching locations...
                        </div>
                    )}

                    {!isLoading && autocompleteError && (
                        <div className="location-autocomplete-status">
                            {autocompleteError}
                        </div>
                    )}

                    {!isLoading && !autocompleteError && suggestions.map((suggestion, index) => {
                        const isHighlighted = index === highlightedIndex;

                        return (
                            <button
                                id={`${listboxId}-option-${index}`}
                                key={`${suggestion.provider}-${suggestion.latitude}-${suggestion.longitude}-${index}`}
                                type="button"
                                className={`location-autocomplete-option ${isHighlighted ? "is-highlighted" : ""}`.trim()}
                                role="option"
                                aria-selected={isHighlighted}
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    selectSuggestion(suggestion);
                                }}
                            >
                                <MapPin aria-hidden="true" />

                                <span>
                                    {formatLocationInlineLabel(suggestion.label)}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
