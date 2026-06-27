import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import Navbar from "../../../components/layout/Navbar";

/* ==================================================
   NAVBAR TESTS
   Tests main navigation rendering and auth actions

   Handles:
   - public navigation links
   - authenticated navigation links
   - main navigation landmark
   - user menu integration
   - logout redirect flow
   - mobile navigation menu toggle state
   - mobile navigation accessibility relationships
   - mobile authenticated navigation
   - mobile logout flow
   - decorative mobile menu icon

   Notes:
   - mocks authenticated user state
   - mocks NavbarUserMenu behavior
   - uses MemoryRouter for navigation links
================================================== */

let mockUser = null;

const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../../../features/auth/hooks/useAuth", () => ({
    useAuth: () => ({
        user: mockUser,
        logout: mockLogout
    })
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");

    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock("../../../components/layout/NavbarUserMenu", () => ({
    default: ({ user, avatar, onLogout }) => (
        <div data-testid="navbar-user-menu">
            <img src={avatar} alt={`${user.name} avatar`} />
            <button type="button" onClick={onLogout}>
                Logout
            </button>
        </div>
    )
}));

describe("Navbar", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderNavbar = () =>
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

    beforeEach(() => {
        vi.clearAllMocks();
        mockUser = null;
    });


    /* =============================
       PUBLIC NAVIGATION
    ============================= */

    it("renders public navigation for guests", () => {
        renderNavbar();

        expect(screen.getByRole("link", { name: "PlanTogether" })).toHaveAttribute("href", "/");
        expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute("href", "/events");
        expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
        expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute("href", "/register");

        expect(screen.queryByRole("link", { name: "Create event" })).not.toBeInTheDocument();
        expect(screen.queryByTestId("navbar-user-menu")).not.toBeInTheDocument();
    });


    /* =============================
       AUTHENTICATED NAVIGATION
    ============================= */

    it("renders authenticated navigation for logged-in users", () => {
        mockUser = {
            name: "John",
            avatar: null
        };

        renderNavbar();

        expect(screen.getByRole("link", { name: "Create event" })).toHaveAttribute("href", "/events/create");
        expect(screen.getByTestId("navbar-user-menu")).toBeInTheDocument();
        expect(screen.getByAltText("John avatar")).toBeInTheDocument();

        expect(screen.queryByRole("link", { name: "Login" })).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Register" })).not.toBeInTheDocument();
    });

    it("renders accessible user avatar image", () => {
        mockUser = {
            name: "John",
            avatar: null
        };

        renderNavbar();

        expect(screen.getByAltText("John avatar")).toBeInTheDocument();
    });

    /* =============================
       SEMANTIC NAVIGATION
    ============================= */

    it("renders main navigation landmark", () => {
        renderNavbar();

        expect(screen.getByRole("navigation", { name: "Main navigation" })).toBeInTheDocument();
    });

    it("renders accessible authenticated navigation links", () => {
        mockUser = {
            name: "John",
            avatar: null
        };

        renderNavbar();

        expect(screen.getByRole("link", {
            name: "Create event"
        })).toBeInTheDocument();
    });

    /* =============================
       LOGOUT FLOW
    ============================= */

    it("logs out and redirects to home", async () => {
        const user = userEvent.setup();

        mockUser = {
            name: "John",
            avatar: null
        };

        renderNavbar();

        const desktopLogoutButton = screen
            .getByTestId("navbar-user-menu")
            .querySelector("button");

        await user.click(desktopLogoutButton);

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });
    });

    /* =============================
       MOBILE MENU
    ============================= */

    it("should toggle mobile navigation menu", async () => {
        const user = userEvent.setup();

        renderNavbar();

        const toggleButton = screen.getByRole("button", {
            name: /open navigation menu/i
        });

        await user.click(toggleButton);

        expect(toggleButton).toHaveAttribute("aria-expanded", "true");

        const menu = document.getElementById(toggleButton.getAttribute("aria-controls"));

        expect(menu).toHaveClass("is-open");
    });

    it("should associate mobile toggle with mobile menu", () => {
        renderNavbar();

        const toggleButton = screen.getByRole("button", {
            name: /open navigation menu/i
        });

        const menu = document.getElementById(toggleButton.getAttribute("aria-controls"));

        expect(menu).toBeInTheDocument();
    });

    it("should close mobile navigation menu", async () => {
        const user = userEvent.setup();

        renderNavbar();

        const toggleButton = screen.getByRole("button", {
            name: /open navigation menu/i
        });

        await user.click(toggleButton);

        await user.click(screen.getByRole("button", {
            name: /close navigation menu/i
        }));

        const menu = document.getElementById(toggleButton.getAttribute("aria-controls"));

        expect(menu).not.toHaveClass("is-open");
    });

    it("should render mobile authenticated navigation links", () => {
        mockUser = {
            name: "John",
            avatar: null
        };

        renderNavbar();

        expect(screen.getByRole("link", {
            name: "My Events"
        })).toBeInTheDocument();

        expect(screen.getByRole("link", {
            name: "Profile"
        })).toBeInTheDocument();
    });

    it("should logout from mobile navigation", async () => {
        const user = userEvent.setup();

        mockUser = {
            name: "John",
            avatar: null
        };

        renderNavbar();

        await user.click(screen.getByRole("button", {
            name: /open navigation menu/i
        }));

        const logoutButtons = screen.getAllByRole("button", {
            name: "Logout"
        });

        await user.click(logoutButtons[1]);

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });
    });
});
