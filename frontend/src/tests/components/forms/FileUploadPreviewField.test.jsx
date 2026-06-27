import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FileUploadPreviewField from "../../../components/forms/FileUploadPreviewField";

/* ==================================================
   FILE UPLOAD PREVIEW FIELD TESTS
   Tests reusable file upload field behavior

   Handles:
   - conditional dropzone and preview rendering
   - file input rendering
   - variant class rendering
   - selected file preview display
   - existing file preview display
   - drag and drop interactions
   - file removal action
   - validation error display
   - accessible helper and error descriptions
   - decorative upload and remove icons
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

    it("renders default variant class when no variant is provided", () => {
        renderComponent();

        expect(
            screen.getByLabelText("Image upload area").closest(".file-upload-preview-field")
        ).toHaveClass("file-upload-preview-field", "default");
    });

    it("renders custom variant class when provided", () => {
        renderComponent({
            variant: "event"
        });

        expect(
            screen.getByLabelText("Image upload area").closest(".file-upload-preview-field")
        ).toHaveClass("file-upload-preview-field", "event");
    });

    it("renders upload dropzone when no preview is available", () => {
        renderComponent();

        expect(screen.getByLabelText("Image upload area")).toBeInTheDocument();
        expect(screen.queryByAltText("Image preview")).not.toBeInTheDocument();
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

    it("renders selected file preview", () => {
        renderComponent({
            file: validFile
        });

        expect(URL.createObjectURL).toHaveBeenCalledWith(validFile);
        expect(screen.getByAltText("Image preview")).toHaveAttribute("src", "blob:image-preview");
        expect(screen.getByText("image.png")).toBeInTheDocument();
        expect(screen.getByText(/kb/i)).toBeInTheDocument();
    });

    it("renders existing file preview", () => {
        renderComponent({
            currentFile: "existing.png"
        });

        expect(defaultProps.getCurrentFileUrl).toHaveBeenCalledWith("existing.png");
        expect(screen.getByAltText("Image preview")).toHaveAttribute("src", "/uploads/existing.png");
        expect(screen.getByText("Existing image")).toBeInTheDocument();
        expect(screen.getByText("Uploaded previously")).toBeInTheDocument();
    });

    it("hides upload dropzone when selected file preview is available", () => {
        renderComponent({
            file: validFile
        });

        expect(screen.getByAltText("Image preview")).toBeInTheDocument();
        expect(screen.queryByLabelText("Image upload area")).not.toBeInTheDocument();
    });

    it("hides upload dropzone when existing file preview is available", () => {
        renderComponent({
            currentFile: "existing.png"
        });

        expect(screen.getByAltText("Image preview")).toBeInTheDocument();
        expect(screen.queryByLabelText("Image upload area")).not.toBeInTheDocument();
    });

    it("renders decorative upload icon", () => {
        renderComponent();

        const uploadIcon = document.querySelector(".file-upload-preview-icon");

        expect(uploadIcon).toBeInTheDocument();
        expect(uploadIcon).toHaveAttribute("aria-hidden", "true");
    });

    /* =============================
       FILE REMOVAL
    ============================= */

    it("does not render remove button when no preview file exists", () => {
        renderComponent();

        expect(screen.queryByRole("button", {
            name: /remove image/i
        })).not.toBeInTheDocument();
    });

    it("renders decorative remove icon", () => {
        renderComponent({
            file: validFile
        });

        const removeIcon = document.querySelector(".file-upload-preview-remove svg[aria-hidden='true']");

        expect(removeIcon).toBeInTheDocument();
    });

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

    it("does not expose file input label when preview is displayed", () => {
        renderComponent({
            file: validFile
        });

        expect(screen.queryByLabelText("Image (optional)")).not.toBeInTheDocument();
    });
});
