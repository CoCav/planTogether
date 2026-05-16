import { describe, expect, it } from "vitest";

import {
    defaultAvatar,
    defaultEventImage,
    getAvatar,
    getEventImage,
    getUploadedFile
} from "../../utils/uploadedFiles";

/* ==================================================
   UPLOADED FILE UTILS TESTS
   Tests uploaded file URL resolution helpers

   Handles:
   - fallback image behavior
   - external URLs
   - backend relative upload paths
   - avatar resolution
   - event image resolution
================================================== */

describe("uploadedFiles", () => {

    /* =============================
       SHARED UPLOADED FILES
    ============================= */

    it("should return fallback when file is null", () => {
        expect(getUploadedFile(null, "fallback.jpg")).toBe("fallback.jpg");
    });

    it("should return fallback when file is undefined", () => {
        expect(getUploadedFile(undefined, "fallback.jpg")).toBe(
            "fallback.jpg"
        );
    });

    it("should return external URL as is", () => {
        const url = "https://example.com/image.png";

        expect(getUploadedFile(url, "fallback.jpg")).toBe(url);
    });

    it("should resolve backend relative upload path", () => {
        const result = getUploadedFile(
            "/uploads/test.png",
            "fallback.jpg"
        );

        expect(result).toContain("/uploads/test.png");
    });

    /* =============================
       AVATARS
    ============================= */

    it("should return default avatar when avatar is missing", () => {
        expect(getAvatar(null)).toBe(defaultAvatar);
        expect(getAvatar(undefined)).toBe(defaultAvatar);
    });

    it("should return external avatar URL", () => {
        const url = "https://example.com/avatar.png";

        expect(getAvatar(url)).toBe(url);
    });

    it("should resolve backend avatar path", () => {
        expect(getAvatar("/uploads/avatars/avatar.png")).toContain(
            "/uploads/avatars/avatar.png"
        );
    });

    /* =============================
       EVENT IMAGES
    ============================= */

    it("should return default event image when image is missing", () => {
        expect(getEventImage(null)).toBe(defaultEventImage);
        expect(getEventImage(undefined)).toBe(defaultEventImage);
    });

    it("should return external event image URL", () => {
        const url = "https://example.com/event.png";

        expect(getEventImage(url)).toBe(url);
    });

    it("should resolve backend event image path", () => {
        expect(getEventImage("/uploads/events/event.png")).toContain(
            "/uploads/events/event.png"
        );
    });
});
