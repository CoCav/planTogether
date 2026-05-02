import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ProfilePage from "../../pages/ProfilePage";

/* ==================================================
   PROFILE PAGE TESTS
   Tests profile update, avatar upload and password flows
================================================== */

const mockUpdateProfile = vi.fn();
const mockChangePassword = vi.fn();
const mockRefreshUser = vi.fn();

let mockAuthState = {
    user: {
        name: "John Doe",
        email: "john@test.com",
        avatar: null
    },
    refreshUser: mockRefreshUser
};

vi.mock("../../context/useAuth", () => ({
    useAuth: () => mockAuthState
}));

vi.mock("../../api/authApi", () => ({
    updateProfile: (...args) => mockUpdateProfile(...args),
    changePassword: (...args) => mockChangePassword(...args)
}));

vi.mock("../../features/auth/authValidation", () => ({
    validateProfileForm: vi.fn((form) => {
        const errors = {};

        if (!form.name) errors.name = "Name is required";
        if (!form.email) errors.email = "Email is required";

        if (form.avatar?.type === "text/plain") {
            errors.avatar = "Avatar must be an image file";
        }

        return errors;
    }),

    validateChangePasswordForm: vi.fn((form) => {
        const errors = {};

        if (!form.currentPassword) {
            errors.currentPassword = "Current password is required";
        }

        if (!form.newPassword) {
            errors.newPassword = "New password is required";
        }

        if (!form.confirmPassword) {
            errors.confirmPassword = "Confirm password is required";
        } else if (form.newPassword !== form.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }

        if (
            form.currentPassword &&
            form.newPassword &&
            form.currentPassword === form.newPassword
        ) {
            errors.newPassword = "New password must be different from current password";
        }

        return errors;
    })
}));

const renderPage = () =>
    render(
        <MemoryRouter>
            <ProfilePage />
        </MemoryRouter>
    );

const getPasswordField = (name) => document.querySelector(`input[name="${name}"]`);

const fillPasswordForm = async (user, { currentPassword = "oldpass", newPassword = "newpass", confirmPassword = "newpass" } = {}) => {
    await user.type(getPasswordField("currentPassword"), currentPassword);
    await user.type(getPasswordField("newPassword"), newPassword);
    await user.type(getPasswordField("confirmPassword"), confirmPassword);
};

const selectAvatar = async (user, file = new File(["avatar"], "avatar.png", { type: "image/png" })) => {
    await user.upload(screen.getByLabelText(/choose file/i), file);

    return file;
};

describe("ProfilePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        globalThis.URL.createObjectURL = vi.fn(() => "blob:avatar-preview");
        globalThis.URL.revokeObjectURL = vi.fn();

        mockAuthState = {
            user: {
                name: "John Doe",
                email: "john@test.com",
                avatar: null
            },
            refreshUser: mockRefreshUser
        };
    });

    it("shows loading state when user is not available", () => {
        mockAuthState = {
            user: null,
            refreshUser: mockRefreshUser
        };

        renderPage();

        expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
    });

    it("displays user profile data", () => {
        renderPage();

        expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
        expect(screen.getByDisplayValue("john@test.com")).toBeInTheDocument();
        expect(screen.getByText(/choose file/i)).toBeInTheDocument();
    });

    it("shows avatar preview when selecting a valid file", async () => {
        const user = userEvent.setup();

        renderPage();

        await selectAvatar(user);

        expect(screen.getByAltText(/avatar preview/i)).toHaveAttribute(
            "src",
            "blob:avatar-preview"
        );
        expect(screen.getByText("avatar.png")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /remove/i })).toBeInTheDocument();
    });

    it("removes selected avatar when clicking remove", async () => {
        const user = userEvent.setup();

        renderPage();

        await selectAvatar(user);
        await user.click(screen.getByRole("button", { name: /remove/i }));

        expect(screen.queryByAltText(/avatar preview/i)).not.toBeInTheDocument();
        expect(screen.queryByText("avatar.png")).not.toBeInTheDocument();
    });

    it("shows validation errors when profile form is empty", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.clear(screen.getByDisplayValue("John Doe"));
        await user.clear(screen.getByDisplayValue("john@test.com"));
        await user.click(screen.getByRole("button", { name: /update profile/i }));

        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it("clears profile field error when user edits input", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.clear(screen.getByDisplayValue("John Doe"));
        await user.click(screen.getByRole("button", { name: /update profile/i }));

        expect(screen.getByText(/name is required/i)).toBeInTheDocument();

        await user.type(screen.getByPlaceholderText(/your name/i), "John");

        expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
    });

    it("updates profile successfully", async () => {
        const user = userEvent.setup();

        mockUpdateProfile.mockResolvedValue({});
        mockRefreshUser.mockResolvedValue({});

        renderPage();

        await user.type(screen.getByDisplayValue("John Doe"), " Updated");
        await user.click(screen.getByRole("button", { name: /update profile/i }));

        await waitFor(() => {
            expect(mockUpdateProfile).toHaveBeenCalledWith(expect.any(FormData));
        });

        const formData = mockUpdateProfile.mock.calls[0][0];

        expect(formData.get("name")).toBe("John Doe Updated");
        expect(formData.get("email")).toBe("john@test.com");
        expect(formData.get("avatar")).toBeNull();

        expect(mockRefreshUser).toHaveBeenCalled();
        expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });

    it("updates profile successfully with avatar", async () => {
        const user = userEvent.setup();
        const avatar = new File(["avatar"], "avatar.png", { type: "image/png" });

        mockUpdateProfile.mockResolvedValue({});
        mockRefreshUser.mockResolvedValue({});

        renderPage();

        await selectAvatar(user, avatar);
        await user.click(screen.getByRole("button", { name: /update profile/i }));

        await waitFor(() => {
            expect(mockUpdateProfile).toHaveBeenCalledWith(expect.any(FormData));
        });

        const formData = mockUpdateProfile.mock.calls[0][0];

        expect(formData.get("name")).toBe("John Doe");
        expect(formData.get("email")).toBe("john@test.com");
        expect(formData.get("avatar")).toBe(avatar);

        expect(mockRefreshUser).toHaveBeenCalled();
    });

    it("shows loading state while updating profile", async () => {
        const user = userEvent.setup();

        let resolveRequest;
        mockUpdateProfile.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRequest = resolve;
                })
        );

        renderPage();

        await user.click(screen.getByRole("button", { name: /update profile/i }));

        expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();

        resolveRequest({});
    });

    it("shows error when profile update fails", async () => {
        const user = userEvent.setup();

        mockUpdateProfile.mockRejectedValue(new Error("API error"));

        renderPage();

        await user.click(screen.getByRole("button", { name: /update profile/i }));

        expect(await screen.findByText(/unable to update profile/i)).toBeInTheDocument();
    });

    it("shows validation error when passwords do not match", async () => {
        const user = userEvent.setup();

        renderPage();

        await fillPasswordForm(user, {
            currentPassword: "oldpass",
            newPassword: "newpass",
            confirmPassword: "different"
        });

        await user.click(screen.getByRole("button", { name: /update password/i }));

        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
        expect(mockChangePassword).not.toHaveBeenCalled();
    });

    it("shows validation error when new password matches current password", async () => {
        const user = userEvent.setup();

        renderPage();

        await fillPasswordForm(user, {
            currentPassword: "samepass",
            newPassword: "samepass",
            confirmPassword: "samepass"
        });

        await user.click(screen.getByRole("button", { name: /update password/i }));

        expect(screen.getByText(/new password must be different from current password/i)).toBeInTheDocument();

        expect(mockChangePassword).not.toHaveBeenCalled();
    });

    it("shows validation error when confirm password is empty", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.type(getPasswordField("currentPassword"), "oldpass");
        await user.type(getPasswordField("newPassword"), "newpass");

        await user.click(screen.getByRole("button", { name: /update password/i }));

        expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
        expect(mockChangePassword).not.toHaveBeenCalled();
    });

    it("updates password successfully", async () => {
        const user = userEvent.setup();

        mockChangePassword.mockResolvedValue({});

        renderPage();

        await fillPasswordForm(user);

        await user.click(screen.getByRole("button", { name: /update password/i }));

        await waitFor(() => {
            expect(mockChangePassword).toHaveBeenCalledWith({
                currentPassword: "oldpass",
                newPassword: "newpass"
            });
        });

        expect(screen.getByText(/password updated successfully/i)).toBeInTheDocument();
    });

    it("shows loading state while updating password", async () => {
        const user = userEvent.setup();

        let resolveRequest;
        mockChangePassword.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRequest = resolve;
                })
        );

        renderPage();

        await fillPasswordForm(user);
        await user.click(screen.getByRole("button", { name: /update password/i }));

        expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();

        resolveRequest({});
    });

    it("shows API error for wrong current password", async () => {
        const user = userEvent.setup();

        mockChangePassword.mockRejectedValue({
            response: {
                status: 401,
                data: {
                    message: "Wrong password"
                }
            }
        });

        renderPage();

        await fillPasswordForm(user, {
            currentPassword: "wrong",
            newPassword: "newpass",
            confirmPassword: "newpass"
        });

        await user.click(screen.getByRole("button", { name: /update password/i }));

        expect(await screen.findByText(/wrong password/i)).toBeInTheDocument();
    });

    it("shows API error under new password when backend rejects it", async () => {
        const user = userEvent.setup();

        mockChangePassword.mockRejectedValue({
            response: {
                status: 400,
                data: {
                    message: "New password is too weak"
                }
            }
        });

        renderPage();

        await fillPasswordForm(user, {
            currentPassword: "oldpass",
            newPassword: "weakpass",
            confirmPassword: "weakpass"
        });

        await user.click(screen.getByRole("button", { name: /update password/i }));

        expect(await screen.findByText(/new password is too weak/i)).toBeInTheDocument();
    });

    it("shows generic password update error", async () => {
        const user = userEvent.setup();

        mockChangePassword.mockRejectedValue({
            response: {
                status: 500,
                data: {
                    message: "Unable to update password"
                }
            }
        });

        renderPage();

        await fillPasswordForm(user);
        await user.click(screen.getByRole("button", { name: /update password/i }));

        expect(await screen.findByText(/unable to update password/i)).toBeInTheDocument();
    });

    it("toggles password visibility", async () => {
        const user = userEvent.setup();

        renderPage();

        const passwordInput = screen.getByPlaceholderText(/current password/i);

        expect(passwordInput).toHaveAttribute("type", "password");

        await user.click(screen.getAllByRole("button", { name: /show/i })[0]);

        expect(passwordInput).toHaveAttribute("type", "text");
    });
});
