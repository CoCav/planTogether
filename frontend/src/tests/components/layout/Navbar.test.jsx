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
   - accessible authenticated navigation
   - main navigation landmark
   - accessible main navigation
   - user menu integration
   - logout redirect flow

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

        await user.click(screen.getByRole("button", { name: "Logout" }));

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });
    });
});
