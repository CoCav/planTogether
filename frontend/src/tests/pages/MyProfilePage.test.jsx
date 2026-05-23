import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MyProfilePage from "../../pages/MyProfilePage";

import useMyProfileForm from "../../features/users/authenticated/hooks/form/useMyProfileForm";
import useMyPasswordForm from "../../features/users/authenticated/hooks/form/useMyPasswordForm";

/* ==================================================
   MY PROFILE PAGE TESTS
   Tests authenticated user profile settings page

   Handles:
   - loading state
   - page rendering
   - accessible profile sections
   - profile form integration
   - password form integration
   - hook initialization
================================================== */

/* =============================
   MOCK DATA
============================= */

const mockRefreshUser = vi.fn();

let mockAuthState = {
    user: {
        userId: 1,
        name: "John Doe",
        email: "john@test.com",
        avatar: null
    },
    refreshUser: mockRefreshUser
};

const mockProfileFormActions = {
    handleFieldChange: vi.fn(),
    handleAvatarChange: vi.fn(),
    handleRemoveAvatar: vi.fn(),
    handleSubmit: vi.fn()
};

const mockPasswordFormActions = {
    handleFieldChange: vi.fn(),
    handleTogglePassword: vi.fn(),
    handleSubmit: vi.fn()
};

let mockProfileHookState;
let mockPasswordHookState;

/* =============================
   MOCKS
============================= */

vi.mock("../../features/auth/hooks/useAuth", () => ({
    useAuth: () => mockAuthState
}));

vi.mock("../../features/users/authenticated/hooks/form/useMyProfileForm", () => ({
    default: vi.fn(() => mockProfileHookState)
}));

vi.mock("../../features/users/authenticated/hooks/form/useMyPasswordForm", () => ({
    default: vi.fn(() => mockPasswordHookState)
}));

vi.mock("../../components/users/UserForm", () => ({
    default: ({
        values,
        fieldErrors,
        submitLabel,
        isSubmitting,
        showAvatar,
        onFieldChange,
        onAvatarChange,
        onRemoveAvatar,
        onSubmit
    }) => (
        <form data-testid="user-form" onSubmit={onSubmit}>
            <span>User form</span>
            <span>Name: {values.name}</span>
            <span>Email: {values.email}</span>
            <span>Profile submit: {submitLabel}</span>
            <span>Profile submitting: {String(isSubmitting)}</span>
            <span>Show avatar: {String(showAvatar)}</span>

            {fieldErrors.name && <span>{fieldErrors.name}</span>}

            <button type="button" onClick={onFieldChange}>
                Change profile field
            </button>

            <button type="button" onClick={onAvatarChange}>
                Change avatar
            </button>

            <button type="button" onClick={onRemoveAvatar}>
                Remove avatar
            </button>

            <button type="submit">
                Submit profile form
            </button>
        </form>
    )
}));

vi.mock("../../components/users/UserPasswordForm", () => ({
    default: ({
        values,
        fieldErrors,
        isSubmitting,
        showPasswords,
        onFieldChange,
        onSubmit,
        onTogglePassword
    }) => (
        <form data-testid="user-password-form" onSubmit={onSubmit}>
            <span>User password form</span>
            <span>Current password: {values.currentPassword}</span>
            <span>Password submitting: {String(isSubmitting)}</span>
            <span>Show new password: {String(showPasswords.newPassword)}</span>

            {fieldErrors.currentPassword && (
                <span>{fieldErrors.currentPassword}</span>
            )}

            <button type="button" onClick={onFieldChange}>
                Change password field
            </button>

            <button
                type="button"
                onClick={() => onTogglePassword("newPassword")}
            >
                Toggle password
            </button>

            <button type="submit">
                Submit password form
            </button>
        </form>
    )
}));

/* =============================
   TEST HELPERS
============================= */

const createProfileHookState = (overrides = {}) => ({
    formState: {
        values: {
            name: "John Doe",
            email: "john@test.com",
            avatar: null,
            currentAvatar: null
        },
        fieldErrors: {},
        ...(overrides.formState || {})
    },

    submitState: {
        isSubmitting: false,
        ...(overrides.submitState || {})
    },

    formActions: {
        ...mockProfileFormActions,
        ...(overrides.formActions || {})
    }
});

const createPasswordHookState = (overrides = {}) => ({
    formState: {
        values: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        },
        fieldErrors: {},
        ...(overrides.formState || {})
    },

    submitState: {
        isSubmitting: false,
        ...(overrides.submitState || {})
    },

    passwordState: {
        showPasswords: {
            currentPassword: false,
            newPassword: false,
            confirmPassword: false
        },
        ...(overrides.passwordState || {})
    },

    formActions: {
        ...mockPasswordFormActions,
        ...(overrides.formActions || {})
    }
});

const renderPage = () => {
    return render(<MyProfilePage />);
};

describe("MyProfilePage", () => {

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        mockAuthState = {
            user: {
                userId: 1,
                name: "John Doe",
                email: "john@test.com",
                avatar: null
            },
            refreshUser: mockRefreshUser
        };

        mockProfileHookState = createProfileHookState();
        mockPasswordHookState = createPasswordHookState();
    });

    /* =============================
       LOADING STATE
    ============================= */

    it("shows loading state when user is not available", () => {
        mockAuthState = {
            user: null,
            refreshUser: mockRefreshUser
        };

        renderPage();

        expect(screen.getByText("Loading profile...")).toBeInTheDocument();
    });

    /* =============================
       PAGE RENDERING
    ============================= */

    it("renders profile page heading and subtitle", () => {
        renderPage();

        expect(
            screen.getByRole("heading", {
                level: 1,
                name: "My Profile"
            })
        ).toBeInTheDocument();

        expect(screen.getByText(
            "Manage your personal information, password, and account settings."
        )).toBeInTheDocument();
    });

    it("renders accessible profile sections", () => {
        renderPage();

        expect(
            screen.getByRole("heading", {
                level: 2,
                name: "Profile Information"
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                level: 2,
                name: "Change Password"
            })
        ).toBeInTheDocument();

        expect(screen.getByText("Update your public account details.")).toBeInTheDocument();

        expect(screen.getByText("Update your password securely.")).toBeInTheDocument();
    });

    it("renders profile layout grid", () => {
        renderPage();

        expect(screen.getByTestId("user-form").closest(".my-profile-grid")).toBeInTheDocument();
    });

    /* =============================
       PROFILE FORM INTEGRATION
    ============================= */

    it("passes profile form state to UserForm", () => {
        mockProfileHookState = createProfileHookState({
            formState: {
                values: {
                    name: "Alice",
                    email: "alice@test.com",
                    avatar: null,
                    currentAvatar: null
                },
                fieldErrors: {
                    name: "Name is required"
                }
            },
            submitState: {
                isSubmitting: true
            }
        });

        renderPage();

        expect(screen.getByText("Name: Alice")).toBeInTheDocument();
        expect(screen.getByText("Email: alice@test.com")).toBeInTheDocument();
        expect(screen.getByText("Name is required")).toBeInTheDocument();
        expect(screen.getByText("Profile submit: Update Profile")).toBeInTheDocument();
        expect(screen.getByText("Profile submitting: true")).toBeInTheDocument();
        expect(screen.getByText("Show avatar: true")).toBeInTheDocument();
    });

    it("passes profile form actions to UserForm", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.click(screen.getByRole("button", {
            name: "Change profile field"
        }));

        await user.click(screen.getByRole("button", {
            name: "Change avatar"
        }));

        await user.click(screen.getByRole("button", {
            name: "Remove avatar"
        }));

        await user.click(screen.getByRole("button", {
            name: "Submit profile form"
        }));

        expect(mockProfileFormActions.handleFieldChange).toHaveBeenCalled();
        expect(mockProfileFormActions.handleAvatarChange).toHaveBeenCalled();
        expect(mockProfileFormActions.handleRemoveAvatar).toHaveBeenCalled();
        expect(mockProfileFormActions.handleSubmit).toHaveBeenCalled();
    });

    /* =============================
       PASSWORD FORM INTEGRATION
    ============================= */

    it("passes password form state to UserPasswordForm", () => {
        mockPasswordHookState = createPasswordHookState({
            formState: {
                values: {
                    currentPassword: "old-password",
                    newPassword: "",
                    confirmPassword: ""
                },
                fieldErrors: {
                    currentPassword: "Current password is required"
                }
            },
            submitState: {
                isSubmitting: true
            },
            passwordState: {
                showPasswords: {
                    currentPassword: false,
                    newPassword: true,
                    confirmPassword: false
                }
            }
        });

        renderPage();

        expect(screen.getByText("Current password: old-password")).toBeInTheDocument();

        expect(screen.getByText("Current password is required")).toBeInTheDocument();

        expect(screen.getByText("Password submitting: true")).toBeInTheDocument();

        expect(screen.getByText("Show new password: true")).toBeInTheDocument();
    });

    it("passes password form actions to UserPasswordForm", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.click(screen.getByRole("button", {
            name: "Change password field"
        }));

        await user.click(screen.getByRole("button", {
            name: "Toggle password"
        }));

        await user.click(screen.getByRole("button", {
            name: "Submit password form"
        }));

        expect(mockPasswordFormActions.handleFieldChange).toHaveBeenCalled();
        expect(mockPasswordFormActions.handleTogglePassword).toHaveBeenCalledWith("newPassword");
        expect(mockPasswordFormActions.handleSubmit).toHaveBeenCalled();
    });

    /* =============================
       HOOK INTEGRATION
    ============================= */

    it("initializes profile form hook with authenticated user context", () => {
        renderPage();

        expect(useMyProfileForm).toHaveBeenCalledWith({
            user: mockAuthState.user,
            refreshUser: mockRefreshUser,
            setMessage: expect.any(Function),
            setError: expect.any(Function)
        });
    });

    it("initializes password form hook with feedback setters", () => {
        renderPage();

        expect(useMyPasswordForm).toHaveBeenCalledWith({
            setMessage: expect.any(Function),
            setError: expect.any(Function)
        });
    });
});
