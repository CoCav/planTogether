import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import EventForm from "../../../components/events/EventForm";

/* ==================================================
   EVENT FORM TESTS
   Tests shared create/edit event form rendering
================================================== */

const validImage = new File(["event image"], "event.png", {
    type: "image/png"
});

const baseForm = {
    title: "",
    description: "",
    type: "",
    theme: "",
    mode: "in_person",
    location: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    maxParticipants: "",
    registrationDeadlineOption: "none",
    registrationDeadlineCustom: "",
    image: null,
    currentImage: null
};

const defaultProps = {
    form: baseForm,
    errors: {},
    onChange: vi.fn(),
    onFileChange: vi.fn(),
    onRemoveFile: vi.fn(),
    onSubmit: vi.fn(),
    submitting: false,
    isOnlineEvent: false,
    showCustomDeadline: false,
    onCancel: vi.fn()
};

describe("EventForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        globalThis.URL.createObjectURL = vi.fn(() => "blob:event-preview");
        globalThis.URL.revokeObjectURL = vi.fn();
    });

    const renderComponent = (props = {}) => {
        return render(
            <EventForm
                {...defaultProps}
                {...props}
                form={{
                    ...defaultProps.form,
                    ...(props.form || {})
                }}
                errors={{
                    ...defaultProps.errors,
                    ...(props.errors || {})
                }}
            />
        );
    };

    it("renders main event fields", () => {
        renderComponent();

        expect(screen.getByText("Create Event")).toBeInTheDocument();
        expect(screen.getByText("Title")).toBeInTheDocument();
        expect(screen.getByText("Mode")).toBeInTheDocument();
        expect(screen.getByText("In person")).toBeInTheDocument();
    });

    it("renders event image upload", () => {
        renderComponent();

        expect(screen.getByText(/drag & drop an image here/i)).toBeInTheDocument();
        expect(screen.getByText(/max 3mb.*jpg.*png.*webp.*gif/i)).toBeInTheDocument();
        expect(screen.getByText(/choose file/i)).toBeInTheDocument();
    });

    it("calls onFileChange when selecting an event image", () => {
        renderComponent();

        const fileInput = screen.getByLabelText(/choose file/i);

        fireEvent.change(fileInput, {
            target: { files: [validImage] }
        });

        expect(defaultProps.onFileChange).toHaveBeenCalledTimes(1);
    });

    it("calls onFileChange when dropping an event image", () => {
        renderComponent();
        fireEvent.drop(screen.getByText(/drag & drop an image here/i).closest(".event-image-upload-panel"), {
            dataTransfer: {
                files: [validImage]
            }
        });

        expect(defaultProps.onFileChange).toHaveBeenCalledTimes(1);
    });

    it("shows selected event image preview card", () => {
        renderComponent({
            form: {
                image: validImage
            }
        });

        expect(URL.createObjectURL).toHaveBeenCalledWith(validImage);

        expect(screen.getByAltText("Event preview")).toHaveAttribute(
            "src",
            "blob:event-preview"
        );

        expect(screen.getByText("event.png")).toBeInTheDocument();
        expect(screen.getByText(/kb/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
    });

    it("shows current event image preview when editing existing image", () => {
        renderComponent({
            form: {
                currentImage: "/uploads/events/event-current.png"
            }
        });

        expect(screen.getByAltText("Event preview")).toBeInTheDocument();
        expect(screen.getByText(/existing image/i)).toBeInTheDocument();
        expect(screen.getByText(/uploaded previously/i)).toBeInTheDocument();

        expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
    });

    it("calls onRemoveFile when clicking remove", () => {
        renderComponent({
            form: {
                image: validImage
            }
        });

        fireEvent.click(screen.getByRole("button", { name: /remove/i }));

        expect(defaultProps.onRemoveFile).toHaveBeenCalledTimes(1);
    });

    it("hides location field for online events", () => {
        renderComponent({
            form: {
                mode: "online"
            },
            isOnlineEvent: true
        });

        expect(screen.queryByText("Location")).not.toBeInTheDocument();
    });

    it("shows custom deadline field when enabled", () => {
        renderComponent({
            form: {
                registrationDeadlineOption: "custom"
            },
            showCustomDeadline: true
        });

        expect(screen.getByText("Custom deadline")).toBeInTheDocument();
    });

    it("renders edit submit label when isEdit is true", () => {
        renderComponent({
            isEdit: true
        });

        expect(screen.getByRole("button", { name: /update event/i })).toBeInTheDocument();
    });

    it("calls onSubmit when form is submitted", () => {
        const onSubmit = vi.fn((e) => e.preventDefault());

        renderComponent({
            onSubmit
        });

        fireEvent.submit(screen.getByRole("button", { name: /create event/i }).closest("form"));

        expect(onSubmit).toHaveBeenCalled();
    });

    it("calls onCancel when cancel button is clicked", () => {
        const onCancel = vi.fn();

        renderComponent({
            onCancel
        });

        fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

        expect(onCancel).toHaveBeenCalled();
    });

    it("displays validation errors", () => {
        renderComponent({
            errors: {
                title: "Title is required",
                image: "Event image must be an image file"
            }
        });

        expect(screen.getByText("Title is required")).toBeInTheDocument();
        expect(screen.getByText("Event image must be an image file")).toBeInTheDocument();
    });
});
