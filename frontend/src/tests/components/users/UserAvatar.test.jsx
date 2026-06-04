import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import UserAvatar from "../../../components/users/UserAvatar";

/* ==================================================
   USER AVATAR TESTS
   Tests reusable user avatar rendering

   Handles:
   - avatar image rendering
   - accessible avatar alternative text
   - fallback alternative text
   - forwarded image props
================================================== */

describe("UserAvatar", () => {

    /* =============================
       RENDERING
    ============================= */

    it("renders user avatar image with user name", () => {
        render(
            <UserAvatar
                src="/avatar.png"
                name="John"
                className="navbar-avatar"
            />
        );

        const avatar = screen.getByAltText("John avatar");

        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute("src", "/avatar.png");
        expect(avatar).toHaveClass("user-avatar", "navbar-avatar");
    });

    it("renders fallback alt text when user name is missing", () => {
        render(
            <UserAvatar
                src="/avatar.png"
            />
        );

        expect(screen.getByAltText("User avatar")).toBeInTheDocument();
    });

    it("forwards image props", () => {
        render(
            <UserAvatar
                src="/avatar.png"
                name="John"
                loading="lazy"
                data-testid="user-avatar"
            />
        );

        expect(screen.getByTestId("user-avatar")).toHaveAttribute("loading", "lazy");
    });

    it("renders base avatar class when no custom class is provided", () => {
        render(
            <UserAvatar
                src="/avatar.png"
                name="John"
            />
        );

        expect(screen.getByAltText("John avatar")).toHaveClass("user-avatar");
    });
});
