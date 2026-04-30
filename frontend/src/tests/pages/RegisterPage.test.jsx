import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "../../pages/RegisterPage";

/* ==================================================
   REGISTER PAGE TESTS
   Tests register form validation, account creation and redirect
================================================== */

const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockRegisterUser = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");

    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock("../../context/useAuth", () => ({
    useAuth: () => ({
        login: mockLogin
    })
}));

vi.mock("../../api/authApi", () => ({
    registerUser: (...args) => mockRegisterUser(...args)
}));

vi.mock("../../features/auth/authValidation", () => ({
    validateRegisterForm: vi.fn((form) => {
        const errors = {};

        if (!form.name) errors.name = "Name is required";
        if (!form.email) errors.email = "Email is required";

        if (!form.password) {
            errors.password = "Password is required";
        } else if (form.password === "weak") {
            errors.password = [
                "Password must contain at least 6 characters",
                "Password must contain at least 1 uppercase",
                "Password must contain at least 1 number"
            ];
        }

        return errors;
    })
}));

const renderPage = () =>
    render(
        <MemoryRouter>
            <RegisterPage />
        </MemoryRouter>
    );

const fillRegisterForm = async (user, { name = "John Doe", email = "john@test.com", password = "Password123" } = {}) => {
    await user.type(screen.getByPlaceholderText(/your name/i), name);
    await user.type(screen.getByPlaceholderText(/your email/i), email);
    await user.type(screen.getByPlaceholderText(/choose a password/i), password);
};

describe("RegisterPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the register form", () => {
        renderPage();

        expect(screen.getByRole("heading", { name: /register/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/choose a password/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^register$/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    });

    it("shows validation errors when submitting empty form", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.click(screen.getByRole("button", { name: /^register$/i }));

        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        expect(mockRegisterUser).not.toHaveBeenCalled();
    });

    it("clears field error when user edits input", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.click(screen.getByRole("button", { name: /^register$/i }));

        expect(screen.getByText(/name is required/i)).toBeInTheDocument();

        await user.type(screen.getByPlaceholderText(/your name/i), "John Doe");

        expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
    });

    it("updates input values when typing", async () => {
        const user = userEvent.setup();

        renderPage();

        const nameInput = screen.getByPlaceholderText(/your name/i);
        const emailInput = screen.getByPlaceholderText(/your email/i);
        const passwordInput = screen.getByPlaceholderText(/choose a password/i);

        await user.type(nameInput, "John Doe");
        await user.type(emailInput, "john@test.com");
        await user.type(passwordInput, "Password123");

        expect(nameInput).toHaveValue("John Doe");
        expect(emailInput).toHaveValue("john@test.com");
        expect(passwordInput).toHaveValue("Password123");
    });

    it("toggles password visibility", async () => {
        const user = userEvent.setup();

        renderPage();

        const passwordInput = screen.getByPlaceholderText(/choose a password/i);

        expect(passwordInput).toHaveAttribute("type", "password");

        await user.click(screen.getByRole("button", { name: /show/i }));
        expect(passwordInput).toHaveAttribute("type", "text");

        await user.click(screen.getByRole("button", { name: /hide/i }));
        expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("displays password requirements", () => {
        renderPage();

        expect(screen.getByText(/your password must contain at least/i)).toBeInTheDocument();
        expect(screen.getByText(/6 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/1 uppercase/i)).toBeInTheDocument();
        expect(screen.getByText(/1 number/i)).toBeInTheDocument();
    });

    it("displays multiple password validation errors", async () => {
        const user = userEvent.setup();

        renderPage();

        await fillRegisterForm(user, {
            password: "weak"
        });

        await user.click(screen.getByRole("button", { name: /^register$/i }));

        expect(screen.getByText(/password must contain at least 6 characters/i)).toBeInTheDocument();

        expect(screen.getByText(/password must contain at least 1 uppercase/i)).toBeInTheDocument();

        expect(screen.getByText(/password must contain at least 1 number/i)).toBeInTheDocument();

        expect(mockRegisterUser).not.toHaveBeenCalled();
    });

    it("registers successfully and redirects", async () => {
        const user = userEvent.setup();

        mockRegisterUser.mockResolvedValue({ data: { token: "fake-token" } });
        mockLogin.mockResolvedValue();

        renderPage();

        await fillRegisterForm(user);
        await user.click(screen.getByRole("button", { name: /^register$/i }));

        await waitFor(() => {
            expect(mockRegisterUser).toHaveBeenCalledWith({
                name: "John Doe",
                email: "john@test.com",
                password: "Password123"
            });
        });

        expect(mockLogin).toHaveBeenCalledWith("fake-token");
        expect(mockNavigate).toHaveBeenCalledWith("/events");
    });

    it("shows loading state while submitting", async () => {
        const user = userEvent.setup();

        let resolveRequest;
        mockRegisterUser.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRequest = resolve;
                })
        );

        renderPage();

        await fillRegisterForm(user);
        await user.click(screen.getByRole("button", { name: /^register$/i }));

        expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();

        resolveRequest({ data: { token: "fake-token" } });
    });

    it("shows error message when register fails", async () => {
        const user = userEvent.setup();

        mockRegisterUser.mockRejectedValue(new Error("Register failed"));

        renderPage();

        await fillRegisterForm(user);
        await user.click(screen.getByRole("button", { name: /^register$/i }));

        expect(await screen.findByText(/unable to register\. please check your information\./i)).toBeInTheDocument();

        expect(mockLogin).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
