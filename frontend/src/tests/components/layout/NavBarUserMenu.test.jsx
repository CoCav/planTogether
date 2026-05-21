import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import NavbarUserMenu from "../../../components/layout/NavbarUserMenu";

/* ==================================================
   NAVBAR USER MENU TESTS
   Tests authenticated user dropdown behavior

   Handles:
   - user avatar trigger rendering
   - accessible menu trigger state
   - dropdown open and close behavior
   - accessible dropdown menu items
   - profile and events menu links
   - logout action
   - outside click closing

   Notes:
   - uses MemoryRouter for dropdown links
   - passes user and logout props directly
================================================== */

describe("NavbarUserMenu", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const mockUser = {
        name: "John",
        avatar: null
    };

    const mockAvatar = "/avatar.png";

    const renderNavbarUserMenu = (onLogout = vi.fn()) =>
        render(
            <MemoryRouter>
                <NavbarUserMenu
                    user={mockUser}
                    avatar={mockAvatar}
                    onLogout={onLogout}
                />
            </MemoryRouter>
        );

    /* =============================
       TRIGGER
    ============================= */

    it("renders user menu trigger with avatar", () => {
        renderNavbarUserMenu();

        expect(screen.getByRole("button", { name: /open john menu/i })).toBeInTheDocument();
        expect(screen.getByAltText("John avatar")).toHaveAttribute("src", mockAvatar);
    });

    it("renders accessible menu trigger attributes", () => {
        renderNavbarUserMenu();

        const trigger = screen.getByRole("button", {
            name: /open john menu/i
        });

        expect(trigger).toHaveAttribute("aria-haspopup", "menu");
        expect(trigger).toHaveAttribute("aria-controls", "navbar-user-dropdown");
        expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    /* =============================
       DROPDOWN VISIBILITY
    ============================= */

    it("opens and closes the dropdown when clicking the trigger", async () => {
        const user = userEvent.setup();

        renderNavbarUserMenu();

        const trigger = screen.getByRole("button", { name: /open john menu/i });

        expect(trigger).toHaveAttribute("aria-expanded", "false");

        await user.click(trigger);

        expect(trigger).toHaveAttribute("aria-expanded", "true");
        expect(screen.getByRole("menu")).toBeInTheDocument();

        await user.click(trigger);

        expect(trigger).toHaveAttribute("aria-expanded", "false");
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("updates trigger accessible label when menu opens", async () => {
        const user = userEvent.setup();

        renderNavbarUserMenu();

        await user.click(screen.getByRole("button", {
            name: /open john menu/i
        }));

        expect(screen.getByRole("button", {
            name: /close john menu/i
        })).toBeInTheDocument();
    });

    it("closes the dropdown when clicking outside", async () => {
        const user = userEvent.setup();

        renderNavbarUserMenu();

        await user.click(screen.getByRole("button", { name: /open john menu/i }));

        expect(screen.getByRole("menu")).toBeInTheDocument();

        await user.click(document.body);

        await waitFor(() => {
            expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        });
    });


    /* =============================
       MENU LINKS
    ============================= */

    it("renders dropdown navigation links when open", async () => {
        const user = userEvent.setup();

        renderNavbarUserMenu();

        await user.click(screen.getByRole("button", { name: /open john menu/i }));

        expect(screen.getByRole("menuitem", { name: "My Profile" })).toHaveAttribute("href", "/profile");
        expect(screen.getByRole("menuitem", { name: "My Events" })).toHaveAttribute("href", "/my-events");
    });

    it("renders dropdown as accessible menu", async () => {
        const user = userEvent.setup();

        renderNavbarUserMenu();

        await user.click(screen.getByRole("button", {
            name: /open john menu/i
        }));

        expect(screen.getByRole("menu")).toHaveAttribute("id", "navbar-user-dropdown");

        expect(screen.getAllByRole("menuitem")).toHaveLength(3);
    });

    it("closes the dropdown after clicking a navigation link", async () => {
        const user = userEvent.setup();

        renderNavbarUserMenu();

        await user.click(screen.getByRole("button", { name: /open john menu/i }));
        await user.click(screen.getByRole("menuitem", { name: "My Profile" }));

        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });


    /* =============================
       LOGOUT
    ============================= */

    it("calls logout and closes the dropdown", async () => {
        const user = userEvent.setup();
        const mockLogout = vi.fn();

        renderNavbarUserMenu(mockLogout);

        await user.click(screen.getByRole("button", { name: /open john menu/i }));
        await user.click(screen.getByRole("menuitem", { name: "Logout" }));

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalledTimes(1);
            expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        });
    });
});
