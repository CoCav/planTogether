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
   - image upload interactions
   - image preview rendering
   - accessible image upload controls
   - conditional fields
   - started event field restrictions
   - submit and cancel actions
   - validation error display
   - accessible form field descriptions
   - accessible invalid field states
================================================== */


describe("EventForm", () => {

    /* =============================
       TEST DATA
    ============================= */

    const validImage = new File(["event image"], "event.png", {
        type: "image/png"
    });

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

        globalThis.URL.createObjectURL = vi.fn(() => "blob:event-preview");
        globalThis.URL.revokeObjectURL = vi.fn();
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
        expect(screen.getByLabelText(/start date time/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/end date time/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/registration deadline/i)).toBeInTheDocument();

        expect(screen.getByLabelText(/start date time/i)).toHaveAttribute("type", "datetime-local");
        expect(screen.getByLabelText(/end date time/i)).toHaveAttribute("type", "datetime-local");
    });

    it("keeps start datetime enabled by default", () => {
        renderComponent();

        expect(screen.getByLabelText(/start date time/i)).toBeEnabled();
    });

    it("disables start datetime when start datetime is locked", () => {
        renderComponent({
            isStartDateTimeDisabled: true
        });

        expect(screen.getByLabelText(/start date time/i)).toBeDisabled();
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

    it("renders event image upload controls", () => {
        renderComponent();

        expect(screen.getByText(/drag & drop an image here/i)).toBeInTheDocument();
        expect(screen.getByText(/max 3mb.*jpg.*png.*webp.*gif/i)).toBeInTheDocument();
        expect(screen.getByText(/choose file/i)).toBeInTheDocument();

        expect(screen.getByLabelText(/choose file/i)).toHaveAttribute(
            "accept",
            "image/jpeg,image/png,image/webp,image/gif"
        );
    });

    it("calls onImageChange when selecting an event image", () => {
        renderComponent();

        fireEvent.change(screen.getByLabelText(/choose file/i), {
            target: {
                files: [validImage]
            }
        });

        expect(defaultProps.onImageChange).toHaveBeenCalledTimes(1);
    });

    it("calls onImageChange when dropping an event image", () => {
        renderComponent();

        fireEvent.drop(
            screen.getByText(/drag & drop an image here/i).closest(".event-form-upload"),
            {
                dataTransfer: {
                    files: [validImage]
                }
            }
        );

        expect(defaultProps.onImageChange).toHaveBeenCalledTimes(1);
    });

    it("applies drag active class while dragging over upload area", () => {
        renderComponent();

        const uploadPanel = screen
            .getByText(/drag & drop an image here/i)
            .closest(".event-form-upload");

        fireEvent.dragEnter(uploadPanel);

        expect(uploadPanel).toHaveClass("drag-active");

        fireEvent.dragLeave(uploadPanel);

        expect(uploadPanel).not.toHaveClass("drag-active");
    });

    /* =============================
       IMAGE PREVIEW
    ============================= */

    it("shows selected event image preview card", () => {
        renderComponent({
            values: {
                image: validImage
            }
        });

        expect(URL.createObjectURL).toHaveBeenCalledWith(validImage);

        expect(screen.getByAltText("Event preview")).toHaveAttribute("src", "blob:event-preview");

        expect(screen.getByText("event.png")).toBeInTheDocument();
        expect(screen.getByText(/kb/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
    });

    it("shows current event image preview when editing existing image", () => {
        renderComponent({
            values: {
                currentImage: "/uploads/events/event-current.png"
            }
        });

        expect(screen.getByAltText("Event preview")).toBeInTheDocument();
        expect(screen.getByText(/existing image/i)).toBeInTheDocument();
        expect(screen.getByText(/uploaded previously/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
    });

    it("calls onRemoveImage when clicking remove", () => {
        renderComponent({
            values: {
                image: validImage
            }
        });

        fireEvent.click(screen.getByRole("button", { name: /remove/i }));

        expect(defaultProps.onRemoveImage).toHaveBeenCalledTimes(1);
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
