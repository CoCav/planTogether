import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FileUploadPreviewField from "../../../components/forms/FileUploadPreviewField";

/* ==================================================
   FILE UPLOAD PREVIEW FIELD TESTS
   Tests reusable file upload field behavior

   Handles:
   - file input rendering
   - selected file preview display
   - existing file preview display
   - drag and drop interactions
   - file removal action
   - validation error display
   - accessible helper and error descriptions
================================================== */

describe("FileUploadPreviewField", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const validFile = new File(["image"], "image.png", {
        type: "image/png"
    });

    const defaultProps = {
        label: "Image (optional)",
        inputId: "test-image",
        fieldName: "image",
        accept: "image/jpeg,image/png,image/webp,image/gif",

        file: null,
        currentFile: null,
        error: undefined,

        uploadAreaLabel: "Image upload area",
        title: "Drag & drop an image here",
        hint: "Max 3MB • JPG, PNG, WEBP or GIF",

        previewAlt: "Image preview",
        existingFileLabel: "Existing image",
        removeLabel: "Remove image",

        allowedPreviewTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ],
        getCurrentFileUrl: vi.fn((file) => `/uploads/${file}`),

        onFileChange: vi.fn(),
        onRemoveFile: vi.fn()
    };

    const renderComponent = (props = {}) => {
        return render(
            <FileUploadPreviewField
                {...defaultProps}
                {...props}
            />
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();

        globalThis.URL.createObjectURL = vi.fn(() => "blob:image-preview");
        globalThis.URL.revokeObjectURL = vi.fn();
    });

    /* =============================
       RENDERING
    ============================= */

    it("renders file upload field controls", () => {
        renderComponent();

        expect(screen.getByLabelText("Image (optional)")).toBeInTheDocument();
        expect(screen.getByLabelText("Image upload area")).toBeInTheDocument();
        expect(screen.getByText("Drag & drop an image here")).toBeInTheDocument();
        expect(screen.getByText("Max 3MB • JPG, PNG, WEBP or GIF")).toBeInTheDocument();

        expect(screen.getByLabelText("Image (optional)")).toHaveAttribute(
            "accept",
            "image/jpeg,image/png,image/webp,image/gif"
        );
    });

    /* =============================
       FILE SELECTION
    ============================= */

    it("calls onFileChange when selecting a file", async () => {
        const user = userEvent.setup();
        const onFileChange = vi.fn();

        renderComponent({
            onFileChange
        });

        await user.upload(screen.getByLabelText("Image (optional)"), validFile);

        expect(onFileChange).toHaveBeenCalledTimes(1);
    });

    /* =============================
       FILE PREVIEW
    ============================= */

    it("shows selected file preview", () => {
        renderComponent({
            file: validFile
        });

        expect(URL.createObjectURL).toHaveBeenCalledWith(validFile);
        expect(screen.getByAltText("Image preview")).toHaveAttribute("src", "blob:image-preview");
        expect(screen.getByText("image.png")).toBeInTheDocument();
        expect(screen.getByText(/kb/i)).toBeInTheDocument();
    });

    it("shows existing file preview", () => {
        renderComponent({
            currentFile: "existing.png"
        });

        expect(defaultProps.getCurrentFileUrl).toHaveBeenCalledWith("existing.png");
        expect(screen.getByAltText("Image preview")).toHaveAttribute("src", "/uploads/existing.png");
        expect(screen.getByText("Existing image")).toBeInTheDocument();
        expect(screen.getByText("Uploaded previously")).toBeInTheDocument();
    });

    /* =============================
       FILE REMOVAL
    ============================= */

    it("calls onRemoveFile when clicking remove", async () => {
        const user = userEvent.setup();
        const onRemoveFile = vi.fn();

        renderComponent({
            file: validFile,
            onRemoveFile
        });

        await user.click(screen.getByRole("button", {
            name: "Remove image"
        }));

        expect(onRemoveFile).toHaveBeenCalledTimes(1);
    });

    /* =============================
       DRAG AND DROP
    ============================= */

    it("calls onFileChange when dropping a file", () => {
        const onFileChange = vi.fn();

        renderComponent({
            onFileChange
        });

        fireEvent.drop(screen.getByLabelText("Image upload area"), {
            dataTransfer: {
                files: [validFile]
            }
        });

        expect(onFileChange).toHaveBeenCalledTimes(1);

        expect(onFileChange).toHaveBeenCalledWith({
            target: {
                name: "image",
                files: [validFile]
            }
        });
    });

    it("does not call onFileChange when dropping without file", () => {
        const onFileChange = vi.fn();

        renderComponent({
            onFileChange
        });

        fireEvent.drop(screen.getByLabelText("Image upload area"), {
            dataTransfer: {
                files: []
            }
        });

        expect(onFileChange).not.toHaveBeenCalled();
    });

    it("applies drag active class while dragging over upload area", () => {
        renderComponent();

        const uploadArea = screen.getByLabelText("Image upload area");

        fireEvent.dragEnter(uploadArea);
        expect(uploadArea).toHaveClass("drag-active");

        fireEvent.dragLeave(uploadArea);
        expect(uploadArea).not.toHaveClass("drag-active");
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("associates upload input with helper and validation descriptions", () => {
        renderComponent({
            error: "Image must be a valid file"
        });

        expect(screen.getByText("Image must be a valid file")).toBeInTheDocument();

        expect(screen.getByLabelText("Image (optional)")).toHaveAttribute(
            "aria-describedby",
            "test-image-hint test-image-error"
        );
    });

    it("associates upload input with helper description when there is no error", () => {
        renderComponent();

        expect(screen.getByLabelText("Image (optional)")).toHaveAttribute("aria-describedby", "test-image-hint");
    });
});
