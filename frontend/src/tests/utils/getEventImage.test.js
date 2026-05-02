import { describe, it, expect, vi } from "vitest";

vi.mock("../../assets/pexels-jrdb99-19683874.jpg", () => ({
    default: "default-event-image.jpg"
}));

import { getEventImage } from "../../utils/getEventImage";

/* ==================================================
   GET EVENT IMAGE TESTS
   Tests event image source resolution helper
================================================== */

describe("getEventImage", () => {
    it("returns default event image when image is null/undefined/empty", () => {
        expect(getEventImage(null)).toBe("default-event-image.jpg");
        expect(getEventImage(undefined)).toBe("default-event-image.jpg");
        expect(getEventImage("")).toBe("default-event-image.jpg");
    });

    it("returns external URL as is", () => {
        const url = "https://example.com/event.png";

        expect(getEventImage(url)).toBe(url);
    });

    it("returns API origin URL for relative event image path", () => {
        const imagePath = "/uploads/events/event-test.png";

        const result = getEventImage(imagePath);

        expect(result).toContain(imagePath);
        expect(result).not.toContain("/api/uploads");
    });
});
