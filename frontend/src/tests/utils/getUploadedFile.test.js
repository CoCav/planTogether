import { describe, expect, it } from "vitest";
import { getUploadedFile, getAvatar, getEventImage, defaultAvatar, defaultEventImage } from "../../utils/getUploadedFile";

/* ==================================================
   GET UPLOADED FILE TESTS
   Tests image resolution helpers (avatar & event images)

   Covers:
   - fallback behavior (null / undefined)
   - external URLs
   - backend relative paths
================================================== */

describe("getUploadedFile", () => {
    it("returns fallback when file is null", () => {
        const result = getUploadedFile(null, "fallback.jpg");

        expect(result).toBe("fallback.jpg");
    });

    it("returns fallback when file is undefined", () => {
        const result = getUploadedFile(undefined, "fallback.jpg");

        expect(result).toBe("fallback.jpg");
    });

    it("returns external URL as is", () => {
        const url = "https://example.com/image.png";

        const result = getUploadedFile(url, "fallback.jpg");

        expect(result).toBe(url);
    });

    it("prepends API origin for relative paths", () => {
        const result = getUploadedFile("/uploads/test.png", "fallback.jpg");

        expect(result).toContain("/uploads/test.png");
        expect(result).toMatch(/^http/); // dépend de ton env
    });
});

describe("getAvatar", () => {
    it("returns default avatar when avatar is null", () => {
        const result = getAvatar(null);

        expect(result).toBe(defaultAvatar);
    });

    it("returns external avatar URL", () => {
        const url = "https://example.com/avatar.png";

        const result = getAvatar(url);

        expect(result).toBe(url);
    });

    it("resolves backend avatar path", () => {
        const result = getAvatar("/uploads/avatars/avatar.png");

        expect(result).toContain("/uploads/avatars/avatar.png");
    });
});

describe("getEventImage", () => {
    it("returns default event image when image is null", () => {
        const result = getEventImage(null);

        expect(result).toBe(defaultEventImage);
    });

    it("returns external image URL", () => {
        const url = "https://example.com/event.png";

        const result = getEventImage(url);

        expect(result).toBe(url);
    });

    it("resolves backend event image path", () => {
        const result = getEventImage("/uploads/events/event.png");

        expect(result).toContain("/uploads/events/event.png");
    });
});
