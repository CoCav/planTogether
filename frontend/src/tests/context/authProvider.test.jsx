import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import AuthProvider from "../../context/authProvider";
import { AuthContext } from "../../context/authContext";

/* ==================================================
   AUTH PROVIDER TESTS
   Tests auth initialization and context actions
================================================== */

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

const renderAuthProvider = () =>
    render(
        <AuthProvider>
            <TestComponent />
        </AuthProvider>
    );

describe("AuthProvider", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("initializes without token", async () => {
        mockGetToken.mockReturnValue(null);

        renderAuthProvider();

        await waitFor(() => {
            expect(screen.getByTestId("loading")).toHaveTextContent("done");
        });

        expect(screen.getByTestId("user")).toHaveTextContent("no-user");
    });

    it("fetches profile when token exists", async () => {
        mockGetToken.mockReturnValue("token");
        mockGetProfile.mockResolvedValue({
            data: { user: { name: "John" } }
        });

        renderAuthProvider();

        expect(await screen.findByText("John")).toBeInTheDocument();
    });

    it("logs in and stores user", async () => {
        mockGetProfile.mockResolvedValue({
            data: { user: { name: "John" } }
        });

        renderAuthProvider();

        screen.getByText("login").click();

        await waitFor(() => {
            expect(mockSetToken).toHaveBeenCalled();
            expect(screen.getByText("John")).toBeInTheDocument();
        });
    });

    it("logs out and clears user", async () => {
        renderAuthProvider();

        screen.getByText("logout").click();

        await waitFor(() => {
            expect(mockRemoveToken).toHaveBeenCalled();
            expect(screen.getByTestId("user")).toHaveTextContent("no-user");
        });
    });

    it("refreshes user", async () => {
        mockGetProfile.mockResolvedValue({
            data: { user: { name: "John" } }
        });

        renderAuthProvider();

        screen.getByText("refresh").click();

        await waitFor(() => {
            expect(mockGetProfile).toHaveBeenCalled();
        });
    });

    it("clears auth state when profile fetch fails", async () => {
        mockGetToken.mockReturnValue("token");
        mockGetProfile.mockRejectedValue(new Error("fail"));

        renderAuthProvider();

        await waitFor(() => {
            expect(mockRemoveToken).toHaveBeenCalled();
            expect(screen.getByTestId("user")).toHaveTextContent("no-user");
        });
    });
});
