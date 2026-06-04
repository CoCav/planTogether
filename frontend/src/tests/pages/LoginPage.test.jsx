import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LoginPage from "../../pages/LoginPage";

/* ==================================================
   LOGIN PAGE TESTS
   Tests account login page behavior

   Handles:
   - login page rendering
   - login form validation
   - field and password interactions
   - remember me preference
   - successful login flow
   - redirect after successful login
   - protected route query param preservation
   - register navigation state forwarding
   - login error feedback

   Notes:
   - mocks auth context login action
   - mocks login API request
   - mocks login redirect location state
   - uses MemoryRouter for account navigation link
================================================== */

/* =============================
   MOCK DATA
============================= */

const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockLoginUser = vi.fn();

let mockLocationState = {
    from: {
        pathname: "/events/42/edit"
    }
};

/* =============================
   MOCKS
============================= */

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

vi.mock("../../features/auth/hooks/useAuth", () => ({
    useAuth: () => ({
        login: mockLogin
    })
}));

vi.mock("../../api/auth/authApi", () => ({
    loginUser: (...args) => mockLoginUser(...args)
}));

/* =============================
   TEST HELPERS
============================= */

const fillLoginForm = async (user, {
    email = "test@test.com",
    password = "Password123"
} = {}) => {

    await user.type(screen.getByLabelText("Email"), email);
    await user.type(screen.getByLabelText(/^password$/i), password);
};

const RegisterLocationStateProbe = () => {
    const location = useLocation();

    return (
        <div>
            Register Page - from {location.state?.from?.pathname}
            {location.state?.from?.search}
        </div>
    );
};

const renderPage = () =>
    render(
        <MemoryRouter>
            <LoginPage />
        </MemoryRouter>
    );

const renderPageWithRegisterRoute = () =>
    render(
        <MemoryRouter initialEntries={["/login"]}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterLocationStateProbe />} />
            </Routes>
        </MemoryRouter>
    );

describe("LoginPage", () => {

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        mockLocationState = {
            from: {
                pathname: "/events/42/edit"
            }
        };
    });

    /* =============================
       PAGE RENDERING
    ============================= */

    it("renders the login page", () => {
        renderPage();

        expect(screen.getByRole("heading", {
            name: "Login"
        })).toBeInTheDocument();

        expect(screen.getByText(
            "Sign in to manage your events and participation."
        )).toBeInTheDocument();

        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
        expect(screen.getByLabelText("Remember me")).toBeInTheDocument();

        expect(screen.getByRole("button", {
            name: "Login"
        })).toBeInTheDocument();

        expect(screen.getByRole("link", {
            name: "Register"
        })).toHaveAttribute("href", "/register");
    });

    it("renders the login section with accessible label", () => {
        renderPage();

        expect(screen.getByLabelText("Login form")).toHaveClass("account-section");
    });

    /* =============================
       FORM VALIDATION
    ============================= */

    it("shows validation errors when submitting empty form", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.click(screen.getByRole("button", {
            name: "Login"
        }));

        expect(screen.getByText("Email is required")).toBeInTheDocument();
        expect(screen.getByText("Password is required")).toBeInTheDocument();

        expect(mockLoginUser).not.toHaveBeenCalled();
    });

    it("clears field error when user edits input", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.click(screen.getByRole("button", {
            name: "Login"
        }));

        expect(screen.getByText("Email is required")).toBeInTheDocument();

        await user.type(screen.getByLabelText("Email"), "test@test.com");

        expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
    });

    /* =============================
       FORM INTERACTIONS
    ============================= */

    it("updates input values when typing", async () => {
        const user = userEvent.setup();

        renderPage();

        await fillLoginForm(user);

        expect(screen.getByLabelText("Email")).toHaveValue("test@test.com");
        expect(screen.getByLabelText(/^password$/i)).toHaveValue("Password123");
    });

    /* =============================
       PASSWORD INTERACTIONS
    ============================= */

    it("toggles password visibility", async () => {
        const user = userEvent.setup();

        renderPage();

        const passwordInput = screen.getByLabelText(/^password$/i);

        expect(passwordInput).toHaveAttribute("type", "password");

        await user.click(screen.getByRole("button", {
            name: "Show password"
        }));

        expect(passwordInput).toHaveAttribute("type", "text");

        await user.click(screen.getByRole("button", {
            name: "Hide password"
        }));

        expect(passwordInput).toHaveAttribute("type", "password");
    });

    /* =============================
       REMEMBER ME
    ============================= */

    it("allows remember me to be checked", async () => {
        const user = userEvent.setup();

        renderPage();

        const checkbox = screen.getByLabelText("Remember me");

        expect(checkbox).not.toBeChecked();

        await user.click(checkbox);

        expect(checkbox).toBeChecked();
    });

    /* =============================
       SUBMISSION
    ============================= */

    it("logs in successfully and redirects to previous page", async () => {
        const user = userEvent.setup();

        mockLoginUser.mockResolvedValue({
            token: "fake-token"
        });

        mockLogin.mockResolvedValue();

        renderPage();

        await fillLoginForm(user);
        await user.click(screen.getByLabelText("Remember me"));

        await user.click(screen.getByRole("button", {
            name: "Login"
        }));

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

    it("preserves query params when redirecting after login", async () => {
        const user = userEvent.setup();

        mockLocationState = {
            from: {
                pathname: "/my-events",
                search: "?view=joined&page=2"
            }
        };

        mockLoginUser.mockResolvedValue({
            token: "fake-token"
        });

        mockLogin.mockResolvedValue();

        renderPage();

        await fillLoginForm(user);

        await user.click(screen.getByRole("button", {
            name: "Login"
        }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/my-events?view=joined&page=2", {
                replace: true
            });
        });
    });

    it("redirects to events page by default after login", async () => {
        const user = userEvent.setup();

        mockLocationState = null;

        mockLoginUser.mockResolvedValue({
            token: "fake-token"
        });

        mockLogin.mockResolvedValue();

        renderPage();

        await fillLoginForm(user);

        await user.click(screen.getByRole("button", {
            name: "Login"
        }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/events", {
                replace: true
            });
        });
    });

    it("shows loading state while submitting", async () => {
        const user = userEvent.setup();

        let resolveRequest;

        mockLoginUser.mockImplementation(() =>
            new Promise((resolve) => {
                resolveRequest = resolve;
            })
        );

        renderPage();

        await fillLoginForm(user);

        await user.click(screen.getByRole("button", {
            name: "Login"
        }));

        expect(screen.getByRole("button", {
            name: "Loading..."
        })).toBeDisabled();

        resolveRequest({
            token: "fake-token"
        });
    });

    /* =============================
       REGISTER NAVIGATION
    ============================= */

    it("forwards protected route state when navigating to register", async () => {
        const user = userEvent.setup();

        mockLocationState = {
            from: {
                pathname: "/my-events",
                search: "?view=joined&page=2"
            }
        };

        renderPageWithRegisterRoute();

        await user.click(screen.getByRole("link", {
            name: "Register"
        }));

        expect(screen.getByText("Register Page - from /my-events?view=joined&page=2")).toBeInTheDocument();
    });

    /* =============================
       ERROR HANDLING
    ============================= */

    it("shows error message when login fails", async () => {
        const user = userEvent.setup();

        mockLoginUser.mockRejectedValue(
            new Error("Login failed")
        );

        renderPage();

        await fillLoginForm(user);

        await user.click(screen.getByRole("button", {
            name: "Login"
        }));

        expect(await screen.findByText(
            "Unable to login. Please check your credentials."
        )).toBeInTheDocument();

        expect(mockLogin).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
