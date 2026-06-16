import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventForm from "../../../components/events/EventForm";

import { createDefaultEventFormValues } from "../../../features/events/form/eventFormConfig";
import { EVENT_MODES } from "../../../features/shared/constants/eventModes";
import { EVENT_REGISTRATION_DEADLINES } from "../../../features/shared/constants/eventRegistrationDeadlines";

/* ==================================================
   EVENT FORM TESTS
   Tests shared create/edit event form rendering

   Handles:
   - event field rendering
   - shared image upload field rendering
   - optional field indicators
   - location autocomplete field rendering
   - selected location map preview rendering
   - conditional field rendering
   - started event field restrictions
   - submit and cancel actions
   - validation error display
   - accessible form field descriptions
   - accessible invalid field states

   Ensures:
   - create/edit event flows share consistent form behavior
   - optional fields are clearly identified
   - location preview is only displayed after a location suggestion is selected
   - validation errors remain accessible
================================================== */

vi.mock("../../../components/events/EventLocationMap", () => ({
    default: ({ selectedLocation }) => (
        <div data-testid="event-location-map">
            Location map preview: {selectedLocation?.label}
        </div>
    )
}));

describe("EventForm", () => {

    /* =============================
       TEST DATA
    ============================= */

    const defaultProps = {
        values: createDefaultEventFormValues(),
        fieldErrors: {},

        submitLabel: "Create Event",
        isSubmitting: false,

        isOnlineEvent: false,
        showCustomDeadline: false,

        onFieldChange: vi.fn(),
        onImageChange: vi.fn(),
        onRemoveImage: vi.fn(),
        onSelectLocation: vi.fn(),

        onSubmit: vi.fn((event) => event.preventDefault()),
        onCancel: vi.fn()
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderComponent = (props = {}) => {
        return render(
            <EventForm
                {...defaultProps}
                {...props}
                values={{
                    ...defaultProps.values,
                    ...(props.values || {})
                }}
                fieldErrors={{
                    ...defaultProps.fieldErrors,
                    ...(props.fieldErrors || {})
                }}
            />
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       FORM FIELDS
    ============================= */

    it("renders main event fields", () => {
        renderComponent();

        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/mode/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/participant limit/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/start date & time/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/end date & time/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/registration deadline/i)).toBeInTheDocument();

        expect(screen.getByLabelText(/start date & time/i)).toHaveAttribute("type", "datetime-local");
        expect(screen.getByLabelText(/end date & time/i)).toHaveAttribute("type", "datetime-local");

        expect(screen.getByPlaceholderText(/search for a city, venue or address/i)).toBeInTheDocument();
    });

    it("identifies optional event fields", () => {
        renderComponent();

        expect(screen.getByLabelText(/participant limit/i)).toHaveAccessibleName(/participant limit\s*\(optional\)/i);
        expect(screen.getByLabelText(/registration deadline/i)).toHaveAccessibleName(/registration deadline\s*\(optional\)/i);
    });

    it("keeps start datetime enabled by default", () => {
        renderComponent();

        expect(screen.getByLabelText(/start date & time/i)).toBeEnabled();
    });

    it("disables start datetime when start datetime is locked", () => {
        renderComponent({
            isStartDateTimeDisabled: true
        });

        expect(screen.getByLabelText(/start date & time/i)).toBeDisabled();
    });

    it("calls onFieldChange when editing a field", () => {
        renderComponent();

        fireEvent.change(screen.getByLabelText(/title/i), {
            target: {
                name: "title",
                value: "Updated Event"
            }
        });

        expect(defaultProps.onFieldChange).toHaveBeenCalledTimes(1);
    });

    /* =============================
       IMAGE UPLOAD
    ============================= */

    it("renders shared event image upload field", () => {
        renderComponent();

        expect(screen.getByText(/drag & drop an image here/i)).toBeInTheDocument();

        expect(screen.getByLabelText(/event image upload area/i)).toBeInTheDocument();
    });

    /* =============================
       CONDITIONAL FIELDS
    ============================= */

    it("hides location field for online events", () => {
        renderComponent({
            values: {
                mode: EVENT_MODES.ONLINE
            },
            isOnlineEvent: true
        });

        expect(screen.queryByLabelText(/location/i)).not.toBeInTheDocument();
    });

    it("shows custom deadline field when enabled", () => {
        renderComponent({
            values: {
                registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.CUSTOM
            },
            showCustomDeadline: true
        });

        expect(screen.getByLabelText(/custom deadline/i)).toBeInTheDocument();

        expect(screen.getByLabelText(/custom deadline/i)).toHaveAttribute("type", "datetime-local");
    });

    it("shows location map preview when physical event has a selected location", () => {
        renderComponent({
            values: {
                mode: EVENT_MODES.IN_PERSON,
                location: "Montreal",
                selectedLocation: {
                    label: "Montréal, Québec, Canada",
                    latitude: 45.5031824,
                    longitude: -73.5698065,
                    provider: "nominatim"
                }
            },
            isOnlineEvent: false
        });

        expect(screen.getByText(/location preview/i)).toBeInTheDocument();
        expect(screen.getByTestId("event-location-map"))
            .toHaveTextContent("Montréal, Québec, Canada");
    });

    it("hides location map preview when physical event has typed location but no selected location", () => {
        renderComponent({
            values: {
                mode: EVENT_MODES.IN_PERSON,
                location: "Montreal",
                selectedLocation: null
            },
            isOnlineEvent: false
        });

        expect(screen.queryByText(/location preview/i)).not.toBeInTheDocument();
        expect(screen.queryByTestId("event-location-map")).not.toBeInTheDocument();
    });

    /* =============================
       FORM ACTIONS
    ============================= */

    it("renders custom submit label", () => {
        renderComponent({
            submitLabel: "Update Event"
        });

        expect(screen.getByRole("button", { name: /update event/i })).toBeInTheDocument();
    });

    it("disables cancel button while submitting", () => {
        renderComponent({
            isSubmitting: true
        });

        expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
    });

    it("calls onSubmit when form is submitted", () => {
        renderComponent();

        fireEvent.submit(screen.getByRole("button", { name: /create event/i }).closest("form"));

        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
    });

    it("calls onCancel when cancel button is clicked", () => {
        renderComponent();

        fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("displays validation errors", () => {
        renderComponent({
            fieldErrors: {
                title: "Title is required",
                image: "Event image must be an image file",
                startDateTime: "Start date and time is required"
            }
        });

        expect(screen.getByText("Title is required")).toBeInTheDocument();
        expect(screen.getByText("Event image must be an image file")).toBeInTheDocument();
        expect(screen.getByText("Start date and time is required")).toBeInTheDocument();
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("associates form fields with validation descriptions", () => {
        renderComponent({
            fieldErrors: {
                title: "Title is required"
            }
        });

        expect(screen.getByLabelText(/title/i)).toHaveAttribute("aria-describedby", "title-error");
    });

    it("marks invalid fields as accessible invalid inputs", () => {
        renderComponent({
            fieldErrors: {
                title: "Title is required"
            }
        });

        expect(screen.getByLabelText(/title/i)).toHaveAttribute("aria-invalid", "true");
    });
});
