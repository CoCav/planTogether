import { describe, expect, it } from "vitest";

import {
    defaultAvatar,
    defaultEventImage,
    getAvatar,
    getEventImage,
    getUploadedFile
} from "../../utils/uploadedFiles";

import {
    createMockAvatarPath,
    createMockEventImagePath,
    createMockExternalImageUrl
} from "../helpers/mocks/mockUploadedFileUrl";

/* ==================================================
   UPLOADED FILE UTILS TESTS
   Tests uploaded file URL resolution helpers

   Handles:
   - fallback file resolution
   - external image URLs
   - backend relative upload paths
   - avatar fallback resolution
   - event image fallback resolution

   Notes:
   - uses reusable uploaded file URL mock helpers
================================================== */

describe("uploadedFile", () => {

    /* =============================
       SHARED FILE RESOLUTION
    ============================= */

    it("should return fallback when file is null", () => {
        const result = getUploadedFile(null, "fallback.jpg");

        expect(result).toBe("fallback.jpg");
    });

    it("should return fallback when file is undefined", () => {
        const result = getUploadedFile(undefined, "fallback.jpg");

        expect(result).toBe("fallback.jpg");
    });

    it("should return external URLs as-is", () => {
        const url = createMockExternalImageUrl();

        const result = getUploadedFile(url, "fallback.jpg");

        expect(result).toBe(url);
    });

    it("should resolve backend relative upload paths", () => {
        const path = createMockAvatarPath();

        const result = getUploadedFile(path, "fallback.jpg");

        expect(result).toContain(path);
    });

    /* =============================
       AVATAR IMAGES
    ============================= */

    it("should return default avatar when avatar is missing", () => {
        expect(getAvatar(null)).toBe(defaultAvatar);
    });

    it("should return external avatar URL", () => {
        const url = createMockExternalImageUrl("avatar.png");

        expect(getAvatar(url)).toBe(url);
    });

    it("should resolve backend avatar path", () => {
        const path = createMockAvatarPath("avatar.png");

        expect(getAvatar(path)).toContain(path);
    });

    /* =============================
       EVENT IMAGES
    ============================= */

    it("should return default event image when image is missing", () => {
        expect(getEventImage(null)).toBe(defaultEventImage);
    });

    it("should return external event image URL", () => {
        const url = createMockExternalImageUrl("event.jpg");

        expect(getEventImage(url)).toBe(url);
    });

    it("should resolve backend event image path", () => {
        const path = createMockEventImagePath("event.jpg");

        expect(getEventImage(path)).toContain(path);
    });
});
