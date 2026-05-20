import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import useFileUploadPreview from "../../hooks/useFileUploadPreview";

/* ==================================================
   USE FILE UPLOAD PREVIEW TESTS
   Tests reusable file upload preview behavior

   Handles:
   - drag state
   - file presence detection
   - file type resolution
   - preview generation
   - current file preview resolution
   - preview eligibility
   - dropped file forwarding
   - object URL cleanup

   Notes:
   - reusable for event images and avatars
   - URL methods are mocked during tests
================================================== */

describe("useFileUploadPreview", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const createImageFile = () => (
        new File(
            ["image"],
            "event.png",
            { type: "image/png" }
        )
    );

    const createTextFile = () => (
        new File(
            ["text"],
            "event.txt",
            { type: "text/plain" }
        )
    );

    const setupHook = (options = {}) => {
        return renderHook(() =>
            useFileUploadPreview({
                onFileChange: vi.fn(),
                ...options
            })
        );
    };

    /* =============================
       URL MOCKS
    ============================= */

    const createObjectURLMock = vi.fn(() => "blob:preview-url");
    const revokeObjectURLMock = vi.fn();

    globalThis.URL.createObjectURL = createObjectURLMock;
    globalThis.URL.revokeObjectURL = revokeObjectURLMock;

    // Reset URL mock call history between test
    beforeEach(() => {
        createObjectURLMock.mockClear();
        revokeObjectURLMock.mockClear();
    });

    /* =============================
       DRAG STATE
    ============================= */

    it("should initialize drag state", () => {
        const { result } = setupHook();

        expect(result.current.isDragging).toBe(false);
    });

    it("should update drag state", () => {
        const { result } = setupHook();

        act(() => {
            result.current.setIsDragging(true);
        });

        expect(result.current.isDragging).toBe(true);
    });

    /* =============================
       FILE STATE
    ============================= */

    it("should detect selected file", () => {
        const { result } = setupHook({
            file: createImageFile()
        });

        expect(result.current.hasFile).toBe(true);
    });

    it("should return false when no file exists", () => {
        const { result } = setupHook();

        expect(result.current.hasFile).toBe(false);
    });

    it("should detect current file", () => {
        const { result } = setupHook({
            currentFile: "event.png"
        });

        expect(result.current.hasFile).toBe(true);
    });

    it("should resolve selected file type", () => {
        const { result } = setupHook({
            file: createImageFile()
        });

        expect(result.current.fileType).toBe("image/png");
    });

    it("should return empty file type when no file is selected", () => {
        const { result } = setupHook();

        expect(result.current.fileType).toBe("");
    });

    /* =============================
       FILE PREVIEW
    ============================= */

    it("should generate preview for allowed file type", () => {
        const { result } = setupHook({
            file: createImageFile(),
            allowedPreviewTypes: ["image/png"]
        });

        expect(createObjectURLMock).toHaveBeenCalledTimes(1);

        expect(result.current.preview).toBe("blob:preview-url");
    });

    it("should generate preview when allowed preview types are empty", () => {
        const { result } = setupHook({
            file: createImageFile()
        });

        expect(result.current.preview).toBe("blob:preview-url");
    });

    it("should not generate preview for unsupported file type", () => {
        const { result } = setupHook({
            file: createTextFile(),
            allowedPreviewTypes: ["image/png"]
        });

        expect(result.current.preview).toBeNull();

        expect(createObjectURLMock).not.toHaveBeenCalled();
    });

    it("should resolve preview from current file", () => {
        const getCurrentFileUrl = vi.fn(
            () => "https://cdn.test/event.png"
        );

        const { result } = setupHook({
            currentFile: "event.png",
            getCurrentFileUrl
        });

        expect(getCurrentFileUrl).toHaveBeenCalledWith("event.png");

        expect(result.current.preview).toBe("https://cdn.test/event.png");
    });

    it("should prioritize selected file preview over current file preview", () => {
        const getCurrentFileUrl = vi.fn(
            () => "https://cdn.test/event.png"
        );

        const { result } = setupHook({
            file: createImageFile(),
            currentFile: "event.png",
            getCurrentFileUrl
        });

        expect(result.current.preview).toBe("blob:preview-url");
    });

    /* =============================
       DROP HANDLING
    ============================= */

    it("should forward dropped file through onFileChange", () => {
        const onFileChange = vi.fn();

        const file = createImageFile();

        const { result } = setupHook({
            fieldName: "image",
            onFileChange
        });

        act(() => {
            result.current.handleDrop({
                preventDefault: vi.fn(),
                dataTransfer: {
                    files: [file]
                }
            });
        });

        expect(onFileChange).toHaveBeenCalledWith({
            target: {
                name: "image",
                files: [file]
            }
        });
    });

    it("should prevent default browser behavior on drop", () => {
        const preventDefault = vi.fn();

        const { result } = setupHook();

        act(() => {
            result.current.handleDrop({
                preventDefault,
                dataTransfer: {
                    files: []
                }
            });
        });

        expect(preventDefault).toHaveBeenCalledTimes(1);
    });

    it("should ignore empty dropped file list", () => {
        const onFileChange = vi.fn();

        const { result } = setupHook({
            onFileChange
        });

        act(() => {
            result.current.handleDrop({
                preventDefault: vi.fn(),
                dataTransfer: {
                    files: []
                }
            });
        });

        expect(onFileChange).not.toHaveBeenCalled();
    });

    it("should stop dragging after drop", () => {
        const { result } = setupHook();

        act(() => {
            result.current.setIsDragging(true);
        });

        act(() => {
            result.current.handleDrop({
                preventDefault: vi.fn(),
                dataTransfer: {
                    files: []
                }
            });
        });

        expect(result.current.isDragging).toBe(false);
    });

    /* =============================
       CLEANUP
    ============================= */

    it("should revoke generated preview URL on cleanup", () => {
        const { unmount } = setupHook({
            file: createImageFile()
        });

        unmount();

        expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:preview-url");
    });

    it("should not revoke preview URL when no preview was generated", () => {
        const { unmount } = setupHook({
            file: createTextFile(),
            allowedPreviewTypes: ["image/png"]
        });

        unmount();

        expect(revokeObjectURLMock).not.toHaveBeenCalled();
    });
});
