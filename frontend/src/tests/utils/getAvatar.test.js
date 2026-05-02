import { describe, it, expect, vi } from "vitest";

vi.mock("../../assets/avatar_user_per_default.png", () => ({
    default: "default-avatar.png"
}));

import { getAvatar } from "../../utils/getAvatar";

/* ==================================================
   GET AVATAR TESTS
   Tests avatar source resolution helper
================================================== */

describe("getAvatar", () => {
    it("returns default avatar when avatar is null/undefined/empty", () => {
        expect(getAvatar(null)).toBe("default-avatar.png");
        expect(getAvatar(undefined)).toBe("default-avatar.png");
        expect(getAvatar("")).toBe("default-avatar.png");
    });

    it("returns external URL as is", () => {
        const url = "https://example.com/avatar.png";

        expect(getAvatar(url)).toBe(url);
    });

    it("returns API origin URL for relative avatar path", () => {
        const avatarPath = "/uploads/avatars/avatar-test.png";

        const result = getAvatar(avatarPath);

        expect(result).toContain(avatarPath);
        expect(result).not.toContain("/api/uploads");
    });
});
