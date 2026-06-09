import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ProtectedRoute from "../../routes/ProtectedRoute";

import { createAuthenticatedUser } from "../factories/users/userFactory";

/* ==================================================
   PROTECTED ROUTE TESTS
   Tests authenticated-only route behavior

   Handles:
   - authenticated access
   - unauthenticated redirects
   - auth loading state with contextual feedback

   Notes:
   - uses reusable authenticated user factories
================================================== */

/* =============================
   MOCK DATA
============================= */

const mockUseAuth = vi.fn();

/* =============================
   MOCKS
============================= */

vi.mock("../../features/auth/hooks/useAuth", () => ({
    useAuth: () => mockUseAuth()
}));


vi.mock("../../components/ui/PageLoader", () => ({
    default: ({ title, description }) => (
        <div role="status">
            <p>{title}</p>
            {description && <p>{description}</p>}
        </div>
    )
}));

/* =============================
   LOCATION STATE HELPERS
============================= */

function LoginLocationStateProbe() {
    const location = useLocation();

    return (
        <div>
            Login Page - from {location.state?.from?.pathname}
        </div>
    );
}


describe("ProtectedRoute", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       TEST HELPERS
    ============================= */

    // Render protected route with login fallback route
    const renderProtectedRoute = () => {
        return render(
            <MemoryRouter initialEntries={["/profile"]}>
                <Routes>
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/login"
                        element={<div>Login Page</div>}
                    />
                </Routes>
            </MemoryRouter>
        );
    };

    /* =============================
       AUTHENTICATED ACCESS
    ============================= */

    it("should render children when user is authenticated", () => {
        mockUseAuth.mockReturnValue({
            user: createAuthenticatedUser(),
            loading: false
        });

        renderProtectedRoute();

        expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    /* =============================
       UNAUTHENTICATED REDIRECT
    ============================= */

    it("should redirect to login when user is not authenticated", () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: false
        });

        renderProtectedRoute();

        expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    it("should preserve attempted route location when redirecting to login", () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: false
        });

        render(
            <MemoryRouter initialEntries={["/events/create"]}>
                <Routes>
                    <Route
                        path="/events/create"
                        element={
                            <ProtectedRoute>
                                <div>Protected Content</div>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/login"
                        element={<LoginLocationStateProbe />}
                    />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText("Login Page - from /events/create")).toBeInTheDocument();
    });

    /* =============================
       LOADING STATE
    ============================= */

    it("should show loading state while auth is loading", () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: true
        });

        renderProtectedRoute();

        expect(screen.getByRole("status")).toHaveTextContent("Loading session...");

        expect(screen.getByText("Checking your authentication status.")).toBeInTheDocument();
    });
});
