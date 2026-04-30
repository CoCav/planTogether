import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../../pages/LoginPage";

/* ==================================================
   LOGIN PAGE TESTS
   Tests login form validation, auth flow and redirect
================================================== */

const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockLoginUser = vi.fn();

let mockLocationState = {
    from: {
        pathname: "/events/42/edit"
    }
};

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");

    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({
            state: mockLocationState
        })
    };
});

vi.mock("../../context/useAuth.js", () => ({
    useAuth: () => ({
        login: mockLogin
    })
}));

vi.mock("../../api/authApi", () => ({
    loginUser: (...args) => mockLoginUser(...args)
}));

vi.mock("../../features/auth/authValidation.js", () => ({
    validateLoginForm: vi.fn((form) => {
        const errors = {};

        if (!form.email) errors.email = "Email is required";
        if (!form.password) errors.password = "Password is required";

        return errors;
    })
}));

const renderPage = () =>
    render(
        <MemoryRouter>
            <LoginPage />
        </MemoryRouter>
    );

const fillLoginForm = async (user) => {
    await user.type(screen.getByPlaceholderText(/your email/i), "test@test.com");
    await user.type(screen.getByPlaceholderText(/your password/i), "Password123");
};

describe("LoginPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockLocationState = {
            from: {
                pathname: "/events/42/edit"
            }
        };
    });

    it("renders the login form", () => {
        renderPage();

        expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/your password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^login$/i })).toBeInTheDocument();
        expect(screen.getByRole("checkbox")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /register/i })).toBeInTheDocument();
    });

    it("shows validation errors when submitting empty form", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.click(screen.getByRole("button", { name: /^login$/i }));

        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        expect(mockLoginUser).not.toHaveBeenCalled();
    });

    it("clears field error when user edits input", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.click(screen.getByRole("button", { name: /^login$/i }));

        expect(screen.getByText(/email is required/i)).toBeInTheDocument();

        await user.type(screen.getByPlaceholderText(/your email/i), "test@test.com");

        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    });

    it("toggles password visibility", async () => {
        const user = userEvent.setup();

        renderPage();

        const passwordInput = screen.getByPlaceholderText(/your password/i);

        expect(passwordInput).toHaveAttribute("type", "password");

        await user.click(screen.getByRole("button", { name: /show/i }));
        expect(passwordInput).toHaveAttribute("type", "text");

        await user.click(screen.getByRole("button", { name: /hide/i }));
        expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("allows remember me to be checked", async () => {
        const user = userEvent.setup();

        renderPage();

        const checkbox = screen.getByRole("checkbox");

        expect(checkbox).not.toBeChecked();

        await user.click(checkbox);

        expect(checkbox).toBeChecked();
    });

    it("logs in successfully and redirects to previous page", async () => {
        const user = userEvent.setup();

        mockLoginUser.mockResolvedValue({ data: { token: "fake-token" } });
        mockLogin.mockResolvedValue();

        renderPage();

        await fillLoginForm(user);
        await user.click(screen.getByRole("checkbox"));
        await user.click(screen.getByRole("button", { name: /^login$/i }));

        await waitFor(() => {
            expect(mockLoginUser).toHaveBeenCalledWith({
                email: "test@test.com",
                password: "Password123"
            });
        });

        expect(mockLogin).toHaveBeenCalledWith("fake-token", true);
        expect(mockNavigate).toHaveBeenCalledWith("/events/42/edit", {
            replace: true
        });
    });

    it("redirects to events page by default after login", async () => {
        const user = userEvent.setup();

        mockLocationState = null;
        mockLoginUser.mockResolvedValue({ data: { token: "fake-token" } });
        mockLogin.mockResolvedValue();

        renderPage();

        await fillLoginForm(user);
        await user.click(screen.getByRole("button", { name: /^login$/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/events", {
                replace: true
            });
        });
    });

    it("shows loading state while submitting", async () => {
        const user = userEvent.setup();

        let resolveRequest;
        mockLoginUser.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRequest = resolve;
                })
        );

        renderPage();

        await fillLoginForm(user);
        await user.click(screen.getByRole("button", { name: /^login$/i }));

        expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();

        resolveRequest({ data: { token: "fake-token" } });
    });

    it("shows error message when login fails", async () => {
        const user = userEvent.setup();

        mockLoginUser.mockRejectedValue(new Error("Login failed"));

        renderPage();

        await fillLoginForm(user);
        await user.click(screen.getByRole("button", { name: /^login$/i }));

        expect(await screen.findByText(/unable to login\. please check your credentials\./i)).toBeInTheDocument();

        expect(mockLogin).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
