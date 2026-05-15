import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";

import AuthProvider from "../../../context/auth/AuthProvider";
import { AuthContext } from "../../../context/auth/AuthContext";

/* ==================================================
   AUTH PROVIDER TESTS
   Tests auth initialization and context actions

   Handles:
   - auth initialization without token
   - auth initialization with token
   - login flow
   - logout flow
   - user refresh
   - failed profile fetch cleanup
================================================== */

const mockGetCurrentUserProfile = vi.fn();
const mockLogoutUser = vi.fn();

const mockGetToken = vi.fn();
const mockSetToken = vi.fn();
const mockRemoveToken = vi.fn();

vi.mock("../../../api/users/userApi", () => ({
    getCurrentUserProfile: () => mockGetCurrentUserProfile()
}));

vi.mock("../../../api/auth/authApi", () => ({
    logoutUser: () => mockLogoutUser()
}));

vi.mock("../../../features/auth/authToken", () => ({
    getToken: () => mockGetToken(),
    setToken: (...args) => mockSetToken(...args),
    removeToken: () => mockRemoveToken()
}));

function TestComponent() {
    const {
        user,
        loading,
        login,
        logout,
        refreshUser
    } = useContext(AuthContext);

    return (
        <div>
            <span data-testid="user">
                {user ? user.name : "no-user"}
            </span>

            <span data-testid="loading">
                {loading ? "loading" : "done"}
            </span>

            <button onClick={() => login("token", true)}>
                login
            </button>

            <button onClick={() => logout()}>
                logout
            </button>

            <button onClick={() => refreshUser()}>
                refresh
            </button>
        </div>
    );
}

describe("AuthProvider", () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       TEST HELPERS
    ============================= */

    const renderAuthProvider = () => {
        return render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );
    };

    /* =============================
       AUTH INITIALIZATION
    ============================= */

    it("should initialize without token", async () => {
        mockGetToken.mockReturnValue(null);

        renderAuthProvider();

        await waitFor(() => {
            expect(screen.getByTestId("loading")).toHaveTextContent("done");
        });

        expect(screen.getByTestId("user")).toHaveTextContent("no-user");
        expect(mockGetCurrentUserProfile).not.toHaveBeenCalled();
    });

    it("should fetch current user when token exists", async () => {
        mockGetToken.mockReturnValue("token");

        mockGetCurrentUserProfile.mockResolvedValue({
            user: {
                name: "John Doe"
            }
        });

        renderAuthProvider();

        expect(await screen.findByText("John Doe")).toBeInTheDocument();

        expect(mockGetCurrentUserProfile).toHaveBeenCalled();
    });

    it("should clear auth state when initial profile fetch fails", async () => {
        mockGetToken.mockReturnValue("token");
        mockGetCurrentUserProfile.mockRejectedValue(new Error("Request failed"));

        renderAuthProvider();

        await waitFor(() => {
            expect(mockRemoveToken).toHaveBeenCalled();
        });

        expect(screen.getByTestId("user")).toHaveTextContent("no-user");
    });

    /* =============================
       AUTH ACTIONS
    ============================= */

    it("should login and store current user", async () => {
        mockGetToken.mockReturnValue(null);

        mockGetCurrentUserProfile.mockResolvedValue({
            user: {
                name: "John Doe"
            }
        });

        renderAuthProvider();

        fireEvent.click(screen.getByText("login"));

        await waitFor(() => {
            expect(mockSetToken).toHaveBeenCalledWith("token", true);
        });

        expect(await screen.findByText("John Doe")).toBeInTheDocument();
    });

    it("should logout and clear current user", async () => {
        mockGetToken.mockReturnValue(null);
        mockLogoutUser.mockResolvedValue({
            success: true
        });

        renderAuthProvider();

        fireEvent.click(screen.getByText("logout"));

        await waitFor(() => {
            expect(mockLogoutUser).toHaveBeenCalled();
            expect(mockRemoveToken).toHaveBeenCalled();
        });

        expect(screen.getByTestId("user")).toHaveTextContent("no-user");
    });

    it("should clear current user even when logout request fails", async () => {
        mockGetToken.mockReturnValue(null);
        mockLogoutUser.mockRejectedValue(new Error("Logout failed"));

        renderAuthProvider();

        fireEvent.click(screen.getByText("logout"));

        await waitFor(() => {
            expect(mockRemoveToken).toHaveBeenCalled();
        });

        expect(screen.getByTestId("user")).toHaveTextContent("no-user");
    });

    it("should refresh current user", async () => {
        mockGetToken.mockReturnValue(null);

        mockGetCurrentUserProfile.mockResolvedValue({
            user: {
                name: "Jane Doe"
            }
        });

        renderAuthProvider();

        fireEvent.click(screen.getByText("refresh"));

        expect(await screen.findByText("Jane Doe")).toBeInTheDocument();

        expect(mockGetCurrentUserProfile).toHaveBeenCalled();
    });
});
