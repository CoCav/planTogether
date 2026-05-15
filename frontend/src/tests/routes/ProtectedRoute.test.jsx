import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../../routes/ProtectedRoute";

/* ==================================================
   PROTECTED ROUTE TESTS
   Tests authenticated-only route behavior

   Handles:
   - authenticated access
   - unauthenticated redirects
   - auth loading state
================================================== */

const mockUseAuth = vi.fn();

vi.mock("../../features/auth/hooks/useAuth", () => ({
    useAuth: () => mockUseAuth()
}));

vi.mock("../../components/ui/PageLoader", () => ({
    default: ({ children }) => <div>{children}</div>
}));

describe("ProtectedRoute", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       TEST HELPERS
    ============================= */

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
            user: { userId: 1 },
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

    /* =============================
       LOADING STATE
    ============================= */

    it("should show loading state while auth is loading", () => {
        mockUseAuth.mockReturnValue({
            user: null,
            loading: true
        });

        renderProtectedRoute();

        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
});
