import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppRouter from "../../routes/AppRouter";

/* ==================================================
   APP ROUTER TESTS
   Tests public and protected route behavior
================================================== */

const mockUseAuth = vi.fn();

vi.mock("../../context/useAuth.js", () => ({
    useAuth: () => mockUseAuth()
}));

vi.mock("../../pages/ProfilePage.jsx", () => ({
    default: () => <div>Profile Page</div>
}));

vi.mock("../../pages/LoginPage", () => ({
    default: () => <div>Login Page</div>
}));

vi.mock("../../pages/HomePage", () => ({
    default: () => <div>Home Page</div>
}));

const renderWithRouter = (initialRoute) =>
    render(
        <MemoryRouter initialEntries={[initialRoute]}>
            <AppRouter />
        </MemoryRouter>
    );

describe("AppRouter / ProtectedRoute", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders protected page when user is authenticated", () => {
        mockUseAuth.mockReturnValue({
            user: { id: 1 },
            loading: false
        });

        renderWithRouter("/profile");

        expect(screen.getByText("Profile Page")).toBeInTheDocument();
    });

    it("redirects to login when user is not authenticated", () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: false
        });

        renderWithRouter("/profile");

        expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    it("shows loading state while auth is loading", () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: true
        });

        renderWithRouter("/profile");

        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it("allows access to public routes", () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: false
        });

        renderWithRouter("/");

        expect(screen.getByText("Home Page")).toBeInTheDocument();
    });
});
