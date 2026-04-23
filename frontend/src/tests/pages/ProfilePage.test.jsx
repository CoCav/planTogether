import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ProfilePage from "../../pages/ProfilePage";

// ----------------------
// Mocks
// ----------------------

const mockUpdateProfile = vi.fn();
const mockChangePassword = vi.fn();
const mockRefreshUser = vi.fn();

// Auth mock
vi.mock("../../context/useAuth", () => ({
    useAuth: () => ({
        user: {
            name: "John Doe",
            email: "john@test.com"
        },
        refreshUser: mockRefreshUser
    })
}));

// API mock
vi.mock("../../api/authApi", () => ({
    updateProfile: (...args) => mockUpdateProfile(...args),
    changePassword: (...args) => mockChangePassword(...args)
}));

// Validation mock
vi.mock("../../features/auth/authValidation", () => ({
    validateProfileForm: vi.fn((form) => {
        const errors = {};
        if (!form.name) errors.name = "Name is required";
        if (!form.email) errors.email = "Email is required";
        return errors;
    }),
    validateChangePasswordForm: vi.fn(() => ({}))
}));

// Simplified UI mock
vi.mock("../../components/ui/PasswordRules", () => ({
    default: () => <div>Password rules</div>
}));

// ----------------------
// Helper
// ----------------------

function renderPage() {
    return render(
        <MemoryRouter>
            <ProfilePage />
        </MemoryRouter>
    );
}

// ----------------------
// Tests
// ----------------------

describe("ProfilePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should display user profile data", () => {
        renderPage();

        expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
        expect(screen.getByDisplayValue("john@test.com")).toBeInTheDocument();
    });

    it("should show validation errors when profile form is empty", async () => {
        const user = userEvent.setup();
        renderPage();

        await user.clear(screen.getByDisplayValue("John Doe"));
        await user.clear(screen.getByDisplayValue("john@test.com"));
        await user.click(screen.getByRole("button", { name: /update profile/i }));

        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it("should update profile successfully", async () => {
        const user = userEvent.setup();
        mockUpdateProfile.mockResolvedValue({});

        renderPage();

        await user.type(screen.getByDisplayValue("John Doe"), " Updated");
        await user.click(screen.getByRole("button", { name: /update profile/i }));

        await waitFor(() => { expect(mockUpdateProfile).toHaveBeenCalled() });

        expect(mockRefreshUser).toHaveBeenCalled();
        expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });

    it("should show error when profile update fails", async () => {
        const user = userEvent.setup();
        mockUpdateProfile.mockRejectedValue(new Error("API error"));

        renderPage();

        await user.click(screen.getByRole("button", { name: /update profile/i }));

        await waitFor(() => { expect(screen.getByText(/unable to update profile/i)).toBeInTheDocument() });
    });

  // ----------------------
  // Password tests
  // ----------------------

    it("should show validation error when passwords do not match", async () => {
        const user = userEvent.setup();
        renderPage();

        await user.type(screen.getByPlaceholderText(/current password/i), "oldpass");
        await user.type(document.querySelector('input[name="newPassword"]'), "newpass");
        await user.type(document.querySelector('input[name="confirmPassword"]'),"different");

        await user.click(screen.getByRole("button", { name: /update password/i }));

        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        expect(mockChangePassword).not.toHaveBeenCalled();
    });

    it("should update password successfully", async () => {
        const user = userEvent.setup();
        mockChangePassword.mockResolvedValue({});

        renderPage();

        await user.type(screen.getByPlaceholderText(/current password/i), "oldpass");
        await user.type(document.querySelector('input[name="newPassword"]'), "newpass");
        await user.type(document.querySelector('input[name="confirmPassword"]'),"newpass");

        await user.click(screen.getByRole("button", { name: /update password/i }));

        await waitFor(() => { expect(mockChangePassword).toHaveBeenCalled() });

        expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument();
    });

    it("should show API error for wrong current password", async () => {
        const user = userEvent.setup();

        mockChangePassword.mockRejectedValue({
            response: {
                status: 401,
                data: { message: "Wrong password" }
            }
        });

        renderPage();

        await user.type(screen.getByPlaceholderText(/current password/i), "wrong");
        await user.type(document.querySelector('input[name="newPassword"]'), "newpass");
        await user.type(document.querySelector('input[name="confirmPassword"]'),"newpass");

        await user.click(screen.getByRole("button", { name: /update password/i }));

        await waitFor(() => { expect(screen.getByText(/wrong password/i)).toBeInTheDocument() });
    });

    it("should toggle password visibility", async () => {
        const user = userEvent.setup();
        renderPage();

        const passwordInput = screen.getByPlaceholderText(/current password/i);

        expect(passwordInput).toHaveAttribute("type", "password");

        await user.click(screen.getAllByRole("button", { name: /show/i })[0]);

        expect(passwordInput).toHaveAttribute("type", "text");
    });
});