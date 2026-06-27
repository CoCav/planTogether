import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import { useAuth } from "../../../features/auth/hooks/useAuth";

import useMyProfileForm from "../../../features/users/authenticated/hooks/form/useMyProfileForm";
import useMyPasswordForm from "../../../features/users/authenticated/hooks/form/useMyPasswordForm";
import useDeleteAccount from "../../../features/users/authenticated/hooks/useDeleteAccount";

import useToast from "../../../hooks/useToast";

import UserForm from "../../../components/users/UserForm";
import UserPasswordForm from "../../../components/users/UserPasswordForm";
import DeleteAccountSection from "../../../components/users/DeleteAccountSection";

import Alert from "../../../components/ui/Alert";
import Card from "../../../components/ui/Card";
import PageLoader from "../../../components/ui/PageLoader";

/* ==================================================
   MY PROFILE PAGE
   Allows authenticated users to manage profile information,
   update their password, and manage account settings

   Handles:
   - auth-ready profile rendering
   - profile form orchestration
   - password form orchestration
   - account deletion orchestration
   - inline success and error feedback
   - temporary feedback cleanup
   - toast forwarding for account deletion
   - accessible profile sections
   - decorative submit icon
================================================== */

export default function MyProfilePage() {
    const { user, loading: authLoading, refreshUser, logout } = useAuth();


    /* =============================
       TOAST FEEDBACK
    ============================= */

    const toast = useToast();


    /* =============================
       FEEDBACK STATE
    ============================= */

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    /* =============================
       PROFILE FORM
    ============================= */

    const {
        formState: profileFormState,
        submitState: profileSubmitState,
        formActions: profileFormActions
    } = useMyProfileForm({
        user,
        refreshUser,
        setMessage,
        setError
    });


    /* =============================
       PASSWORD FORM
    ============================= */

    const {
        formState: passwordFormState,
        submitState: passwordSubmitState,
        passwordState,
        formActions: passwordFormActions
    } = useMyPasswordForm({
        setMessage,
        setError
    });


    /* =============================
       DELETE ACCOUNT
    ============================= */

    const { isDeleting, handleDeleteAccount } = useDeleteAccount({
        logout,
        toast
    });


    /* =============================
       FEEDBACK CLEANUP
    ============================= */

    // Clears feedback messages automatically after delay
    useEffect(() => {
        if (!message && !error) return;

        const timer = setTimeout(() => {
            setMessage("");
            setError("");
        }, 3000);

        return () => clearTimeout(timer);

    }, [
        message,
        error,
        setMessage,
        setError
    ]);


    /* =============================
       LOADING STATE
    ============================= */

    if (authLoading || !user) {
        return (
            <PageLoader
                title="Loading profile..."
                description="Please wait while we load your account details."
            />
        );
    }


    /* =============================
       MAIN RENDER
    ============================= */

    return (
        <main className="container page-section">
            <header className="page-header">
                <div className="page-header-content">
                    <h1 id="my-profile-page-title" className="page-title">
                        My Profile
                    </h1>

                    <p className="page-subtitle">
                        Manage your personal information, password, and account settings.
                    </p>
                </div>
            </header>

            {message && <Alert type="success">{message}</Alert>}
            {error && <Alert type="danger">{error}</Alert>}

            <div className="my-profile-grid">
                <Card>
                    <section aria-labelledby="profile-information-title">
                        <header className="section-header">
                            <h2 id="profile-information-title" className="section-title">
                                Profile Information
                            </h2>

                            <p className="section-subtitle">
                                Update your public account details.
                            </p>
                        </header>

                        <UserForm
                            values={profileFormState.values}
                            fieldErrors={profileFormState.fieldErrors}

                            submitLabel="Update Profile"
                            submitIcon={<Save aria-hidden="true" />}
                            isSubmitting={profileSubmitState.isSubmitting}

                            showAvatar

                            onFieldChange={profileFormActions.handleFieldChange}
                            onAvatarChange={profileFormActions.handleAvatarChange}
                            onRemoveAvatar={profileFormActions.handleRemoveAvatar}

                            onSubmit={profileFormActions.handleSubmit}
                        />
                    </section>
                </Card>

                <Card>
                    <section aria-labelledby="change-password-title">
                        <header className="section-header">
                            <h2 id="change-password-title" className="section-title">
                                Change Password
                            </h2>

                            <p className="section-subtitle">
                                Update your password securely.
                            </p>
                        </header>

                        <UserPasswordForm
                            values={passwordFormState.values}
                            fieldErrors={passwordFormState.fieldErrors}

                            isSubmitting={passwordSubmitState.isSubmitting}

                            showPasswords={passwordState.showPasswords}

                            onFieldChange={passwordFormActions.handleFieldChange}
                            onTogglePassword={passwordFormActions.handleTogglePassword}

                            onSubmit={passwordFormActions.handleSubmit}
                        />
                    </section>
                </Card>
            </div>

            <div className="my-profile-danger-section">
                <Card>
                    <DeleteAccountSection
                        isDeleting={isDeleting}
                        onDeleteAccount={handleDeleteAccount}
                    />
                </Card>
            </div>
        </main>
    );
}
