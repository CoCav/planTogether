import { describe, expect, it } from "vitest";

import {
    ALLOWED_IMAGE_MIME_TYPES,
    MAX_AVATAR_SIZE,
    MAX_EVENT_IMAGE_SIZE,
    validateAvatarFile,
    validateEventImageFile,
    validateImageFile
} from "../../../features/shared/uploadPolicy";

import { createMockImageFile, createMockInvalidFile, createMockOversizedFile } from "../../helpers/mocks/mockFile";

/* ==================================================
   UPLOAD POLICY TESTS
   Tests shared upload validation helpers

   Handles:
   - allowed image MIME types
   - avatar upload validation
   - event image upload validation
   - file size validation

   Notes:
   - uses reusable upload file mock helpers
================================================== */

describe("uploadPolicy", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const validImage = createMockImageFile({
        name: "image.png"
    });

    const invalidImage = createMockInvalidFile({
        name: "file.txt"
    });

    const largeAvatar = createMockOversizedFile({
        name: "large-avatar.png",
        sizeInMb: 3
    });

    const largeEventImage = createMockOversizedFile({
        name: "large-event.png",
        sizeInMb: 4
    });

    /* =============================
       MIME TYPES
    ============================= */

    it("should expose allowed image MIME types", () => {
        expect(ALLOWED_IMAGE_MIME_TYPES).toEqual([
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ]);
    });

    /* =============================
       SHARED IMAGE VALIDATION
    ============================= */

    it("should return null when no file is provided", () => {
        const result = validateImageFile({
            file: null,
            maxSize: MAX_AVATAR_SIZE
        });

        expect(result).toBeNull();
    });

    it("should reject unsupported image file types", () => {
        const result = validateImageFile({
            file: invalidImage,
            maxSize: MAX_AVATAR_SIZE,
            label: "Avatar"
        });

        expect(result).toBe("Avatar must be an image file");
    });

    it("should reject files larger than the max size", () => {
        const result = validateImageFile({
            file: largeAvatar,
            maxSize: MAX_AVATAR_SIZE,
            label: "Avatar"
        });

        expect(result).toBe("Avatar must be less than 2MB");
    });

    it("should accept valid image files", () => {
        const result = validateImageFile({
            file: validImage,
            maxSize: MAX_AVATAR_SIZE,
            label: "Avatar"
        });

        expect(result).toBeNull();
    });

    /* =============================
       AVATAR VALIDATION
    ============================= */

    it("should validate avatar files", () => {
        expect(validateAvatarFile(validImage)).toBeNull();

        expect(validateAvatarFile(invalidImage)).toBe("Avatar must be an image file");

        expect(validateAvatarFile(largeAvatar)).toBe("Avatar must be less than 2MB");
    });

    /* =============================
       EVENT IMAGE VALIDATION
    ============================= */

    it("should validate event image files", () => {
        expect(validateEventImageFile(validImage)).toBeNull();

        expect(validateEventImageFile(invalidImage)).toBe("Event image must be an image file");

        expect(validateEventImageFile(largeEventImage)).toBe("Event image must be less than 3MB");
    });
});
