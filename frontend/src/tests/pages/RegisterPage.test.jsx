import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import RegisterPage from "../../pages/RegisterPage";

// ----------------------
// Mocks
// ----------------------

const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockRegisterUser = vi.fn();

// Router mock
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");

    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

// Auth context mock
vi.mock("../../context/useAuth.js", () => ({
    useAuth: () => ({
        login: mockLogin
    })
}));

// API mock
vi.mock("../../api/authApi", () => ({
    registerUser: (...args) => mockRegisterUser(...args)
}));

// Validation mock
vi.mock("../../features/auth/authValidation.js", () => ({
    validateRegisterForm: vi.fn((form) => {
        const errors = {};
        if (!form.name) errors.name = "Name is required";
        if (!form.email) errors.email = "Email is required";
        if (!form.password) errors.password = "Password is required";
        return errors;
    })
}));

// ----------------------
// Helper
// ----------------------

function renderPage() {
    return render(
        <MemoryRouter>
            <RegisterPage />
        </MemoryRouter>
    );
}

// ----------------------
// Tests
// ----------------------

describe("RegisterPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render the register form", () => {
        renderPage();

        expect(screen.getByRole("heading", { name: /register/i })).toBeInTheDocument();

        expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/choose a password/i)).toBeInTheDocument();

        expect(screen.getByRole("button", { name: /^register$/i })).toBeInTheDocument();
    });

    it("should show validation errors when submitting empty form", async () => {
        const user = userEvent.setup();
        renderPage();

        await user.click(screen.getByRole("button", { name: /^register$/i }));

        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();

        expect(mockRegisterUser).not.toHaveBeenCalled();
    });

    it("should update input values when typing", async () => {
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

    it("should toggle password visibility", async () => {
        const user = userEvent.setup();
        renderPage();

        const passwordInput = screen.getByPlaceholderText(/choose a password/i);

        expect(passwordInput).toHaveAttribute("type", "password");

        await user.click(screen.getByRole("button", { name: /show/i }));
        expect(passwordInput).toHaveAttribute("type", "text");

        await user.click(screen.getByRole("button", { name: /hide/i }));
        expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("should register successfully and redirect", async () => {
        const user = userEvent.setup();

        mockRegisterUser.mockResolvedValue({ data: { token: "fake-token" } });

        mockLogin.mockResolvedValue();

        renderPage();

        const nameInput = screen.getByPlaceholderText(/your name/i);
        const emailInput = screen.getByPlaceholderText(/your email/i);
        const passwordInput = screen.getByPlaceholderText(/choose a password/i);

        await user.type(nameInput, "John Doe");
        await user.type(emailInput, "john@test.com");
        await user.type(passwordInput, "Password123");

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

    it("should show error message when register fails", async () => {
        const user = userEvent.setup();

        mockRegisterUser.mockRejectedValue(new Error("Register failed"));

        renderPage();

        const nameInput = screen.getByPlaceholderText(/your name/i);
        const emailInput = screen.getByPlaceholderText(/your email/i);
        const passwordInput = screen.getByPlaceholderText(/choose a password/i);

        await user.type(nameInput, "John Doe");
        await user.type(emailInput, "john@test.com");
        await user.type(passwordInput, "Password123");

        await user.click(screen.getByRole("button", { name: /^register$/i }));

        await waitFor(() => { expect(screen.getByText(/unable to register\. please check your information\./i)).toBeInTheDocument() });

        expect(mockLogin).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});