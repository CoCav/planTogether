import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppRouter from "../../routes/AppRouter";

// ----------------------
// Mocks
// ----------------------

const mockUseAuth = vi.fn();

// Auth mock
vi.mock("../../context/useAuth.js", () => ({
    useAuth: () => mockUseAuth()
}));

// Page mocks
vi.mock("../../pages/ProfilePage.jsx", () => ({
    default: () => <div>Profile Page</div>
}));

vi.mock("../../pages/LoginPage", () => ({
    default: () => <div>Login Page</div>
}));

vi.mock("../../pages/HomePage", () => ({
    default: () => <div>Home Page</div>
}));

// ----------------------
// Helper
// ----------------------

function renderWithRouter(initialRoute) {
    return render(
        <MemoryRouter initialEntries={[initialRoute]}>
            <AppRouter />
        </MemoryRouter>
    );
}

// ----------------------
// Tests
// ----------------------

describe("AppRouter / ProtectedRoute", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render protected page when user is authenticated", () => {
        mockUseAuth.mockReturnValue({
            user: { id: 1 },
            loading: false
        });

        renderWithRouter("/profile");

        expect(screen.getByText("Profile Page")).toBeInTheDocument();
    });

    it("should redirect to login when user is not authenticated", () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: false
        });

        renderWithRouter("/profile");

        expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    it("should show loading state", () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: true
        });

        renderWithRouter("/profile");

        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it("should allow access to public route", () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: false
        });

        renderWithRouter("/");

        expect(screen.getByText("Home Page")).toBeInTheDocument();
    });
});