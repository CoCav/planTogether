import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import AuthProvider from "../../context/authProvider";
import { AuthContext } from "../../context/authContext";

// Mocks
const mockGetProfile = vi.fn();
const mockLogoutUser = vi.fn();
const mockGetToken = vi.fn();
const mockSetToken = vi.fn();
const mockRemoveToken = vi.fn();

vi.mock("../../api/authApi", () => ({
    getProfile: () => mockGetProfile(),
    logOutUser: () => mockLogoutUser()
}));

vi.mock("../../features/auth/token", () => ({
    getToken: () => mockGetToken(),
    setToken: (...args) => mockSetToken(...args),
    removeToken: () => mockRemoveToken()
}));

// Helper component to access context
function TestComponent() {
    const { user, loading, login, logout, refreshUser } = useContext(AuthContext);

    return (
        <div>
            <span data-testid="user">{user ? user.name : "no-user"}</span>
            <span data-testid="loading">{loading ? "loading" : "done"}</span>
            <button onClick={() => login("token")}>login</button>
            <button onClick={() => logout()}>logout</button>
            <button onClick={() => refreshUser()}>refresh</button>
        </div>
    );
}

describe("AuthProvider", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should initialize without token", async () => {
        mockGetToken.mockReturnValue(null);

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("loading").textContent).toBe("done");
        });

        expect(screen.getByTestId("user").textContent).toBe("no-user");
    });

    it("should fetch profile when token exists", async () => {
        mockGetToken.mockReturnValue("token");
        mockGetProfile.mockResolvedValue({
            data: { user: { name: "John" } }
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText("John")).toBeInTheDocument();
        });
    });

    it("should login and set user", async () => {
        mockGetProfile.mockResolvedValue({
            data: { user: { name: "John" } }
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        screen.getByText("login").click();

        await waitFor(() => {
            expect(mockSetToken).toHaveBeenCalled();
            expect(screen.getByText("John")).toBeInTheDocument();
        });
    });

    it("should logout and clear user", async () => {
        mockGetProfile.mockResolvedValue({
            data: { user: { name: "John" } }
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        screen.getByText("logout").click();

        await waitFor(() => {
            expect(mockRemoveToken).toHaveBeenCalled();
            expect(screen.getByTestId("user").textContent).toBe("no-user");
        });
    });

    it("should refresh user", async () => {
        mockGetProfile.mockResolvedValue({
            data: { user: { name: "John" } }
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        screen.getByText("refresh").click();

        await waitFor(() => {
            expect(mockGetProfile).toHaveBeenCalled();
        });
    });

    it("should handle profile fetch error", async () => {
        mockGetToken.mockReturnValue("token");
        mockGetProfile.mockRejectedValue(new Error("fail"));

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(mockRemoveToken).toHaveBeenCalled();
            expect(screen.getByTestId("user").textContent).toBe("no-user");
        });
    });
});