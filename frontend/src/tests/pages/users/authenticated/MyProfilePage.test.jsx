import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MyProfilePage from "../../../../pages/users/authenticated/MyProfilePage";

import useMyProfileForm from "../../../../features/users/authenticated/hooks/form/useMyProfileForm";
import useMyPasswordForm from "../../../../features/users/authenticated/hooks/form/useMyPasswordForm";
import useDeleteAccount from "../../../../features/users/authenticated/hooks/useDeleteAccount";

import useToast from "../../../../hooks/useToast";

/* ==================================================
   MY PROFILE PAGE TESTS
   Tests authenticated user profile settings page

   Handles:
   - loading state rendering
   - page heading and layout rendering
   - accessible profile sections
   - profile form integration
   - password form integration
   - delete account integration
   - hook initialization
   - toast forwarding
   - auth-ready profile rendering
   - decorative submit icon forwarding
================================================== */

/* =============================
   MOCK DATA
============================= */

const mockRefreshUser = vi.fn();
const mockLogout = vi.fn();

let mockProfileHookState;
let mockPasswordHookState;
let mockDeleteAccountHookState;

let mockAuthState = {
    user: {
        userId: 1,
        name: "John Doe",
        email: "john@test.com",
        avatar: null
    },
    loading: false,
    refreshUser: mockRefreshUser,
    logout: mockLogout
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

const mockDeleteAccountActions = {
    handleDeleteAccount: vi.fn()
};

const mockToast = {
    success: vi.fn(),
    danger: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
};

/* =============================
   MOCKS
============================= */

vi.mock("../../../../features/auth/hooks/useAuth", () => ({
    useAuth: () => mockAuthState
}));

vi.mock("../../../../features/users/authenticated/hooks/form/useMyProfileForm", () => ({
    default: vi.fn(() => mockProfileHookState)
}));

vi.mock("../../../../features/users/authenticated/hooks/form/useMyPasswordForm", () => ({
    default: vi.fn(() => mockPasswordHookState)
}));

vi.mock("../../../../features/users/authenticated/hooks/useDeleteAccount", () => ({
    default: vi.fn(() => mockDeleteAccountHookState)
}));

vi.mock("../../../../components/users/UserForm", () => ({
    default: ({
        values,
        fieldErrors,
        submitLabel,
        submitIcon,
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
            <span>Profile has icon: {String(Boolean(submitIcon))}</span>
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

vi.mock("../../../../components/users/UserPasswordForm", () => ({
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

vi.mock("../../../../components/users/DeleteAccountSection", () => ({
    default: ({
        isDeleting,
        onDeleteAccount
    }) => (
        <section data-testid="delete-account-section">
            <span>Delete account section</span>
            <span>Deleting account: {String(isDeleting)}</span>

            <button type="button" onClick={onDeleteAccount}>
                Delete account action
            </button>
        </section>
    )
}));

vi.mock("../../../../hooks/useToast", () => ({
    default: vi.fn()
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

const createDeleteAccountHookState = (overrides = {}) => ({
    isDeleting: false,
    handleDeleteAccount: mockDeleteAccountActions.handleDeleteAccount,
    ...overrides
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
            loading: false,
            refreshUser: mockRefreshUser,
            logout: mockLogout
        };

        mockProfileHookState = createProfileHookState();
        mockPasswordHookState = createPasswordHookState();
        mockDeleteAccountHookState = createDeleteAccountHookState();

        useToast.mockReturnValue(mockToast);
    });

    /* =============================
       LOADING STATE
    ============================= */

    it("shows loading state while auth is loading", () => {
        mockAuthState = {
            user: null,
            loading: true,
            refreshUser: mockRefreshUser,
            logout: mockLogout
        };

        renderPage();

        expect(screen.getByRole("status")).toHaveTextContent("Loading profile...");
        expect(screen.getByText("Please wait while we load your account details.")).toBeInTheDocument();
    });

    it("shows loading state when user is not available", () => {
        mockAuthState = {
            user: null,
            loading: false,
            refreshUser: mockRefreshUser,
            logout: mockLogout
        };

        renderPage();

        expect(screen.getByRole("status")).toHaveTextContent("Loading profile...");
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

    it("renders delete account section inside danger section layout", () => {
        renderPage();

        expect(
            screen.getByTestId("delete-account-section").closest(".my-profile-danger-section")
        ).toBeInTheDocument();
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
        expect(screen.getByText("Profile has icon: true")).toBeInTheDocument();
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
       DELETE ACCOUNT INTEGRATION
    ============================= */

    it("passes delete account state to DeleteAccountSection", () => {
        mockDeleteAccountHookState = createDeleteAccountHookState({
            isDeleting: true
        });

        renderPage();

        expect(screen.getByTestId("delete-account-section")).toBeInTheDocument();
        expect(screen.getByText("Deleting account: true")).toBeInTheDocument();
    });

    it("passes delete account action to DeleteAccountSection", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.click(screen.getByRole("button", {
            name: "Delete account action"
        }));

        expect(mockDeleteAccountActions.handleDeleteAccount).toHaveBeenCalled();
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

    it("initializes delete account hook with auth and toast handlers", () => {
        renderPage();

        expect(useDeleteAccount).toHaveBeenCalledWith({
            logout: mockLogout,
            toast: mockToast
        });
    });
});
