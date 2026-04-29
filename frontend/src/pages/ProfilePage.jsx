import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { updateProfile, changePassword } from "../api/authApi";
import { validateProfileForm, validateChangePasswordForm } from "../features/auth/authValidation";

import UserProfileForm from "../components/auth/UserProfileForm";
import ChangePasswordForm from "../components/auth/ChangePasswordForm";
import PasswordRequirements from "../components/auth/PasswordRequirements";

import Card from "../components/ui/Card";
import Alert from "../components/ui/Alert";
import PageLoading from "../components/ui/PageLoading";

/* ==================================================
   PROFILE PAGE
   Allows the user to update profile information
   and change their password
================================================== */

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Stores validation errors for each profile form section
    const [profileErrors, setProfileErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});

    // Controls submit loading states for each form
    const [profileSubmitting, setProfileSubmitting] = useState(false);
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);

    // Stores editable profile information
    const [profileForm, setProfileForm] = useState({
        name: user?.name ?? "",
        email: user?.email ?? ""
    });

    // Stores password update fields
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Controls password visibility by field
    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });


    /* =========================
        Feedback cleanup
        Clears success/error messages automatically
    ========================= */

    useEffect(() => {
        if (message || error) {
            const timer = setTimeout(() => {
                setMessage("");
                setError("");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [message, error]);


    /* =========================
        Profile form handling
        Updates profile fields and clears field errors
    ========================= */

    const handleProfileChange = (e) => {
        const { name, value } = e.target;

        setProfileForm((prev) => ({
            ...prev,
            [name]: value
        }));

        setProfileErrors((prev) => ({
            ...prev,
            [name]: undefined
        }));
    };


    /* =========================
        Password form handling
        Updates password fields and clears field errors
    ========================= */

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPasswordForm((prev) => ({
            ...prev,
            [name]: value
        }));

        setPasswordErrors((prev) => ({
            ...prev,
            [name]: undefined
        }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field]
        }));
    };


    /* =========================
        Profile submission
        Validates and updates user profile information
    ========================= */

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        const validationErrors = validateProfileForm(profileForm);

        if (Object.keys(validationErrors).length > 0) {
            setProfileErrors(validationErrors);
            return;
        }

        setProfileErrors({});
        setProfileSubmitting(true);

        try {
            await updateProfile(profileForm);
            await refreshUser();
            setMessage("✅ Profile updated successfully");
        } catch (error) {
            console.error("Error updating profile:", error);
            setError("❌ Unable to update profile");
        } finally {
            setProfileSubmitting(false);
        }
    };


    /* =========================
        Password submission
        Validates and updates user password
    ========================= */

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        const validationErrors = validateChangePasswordForm(passwordForm);

        if (Object.keys(validationErrors).length > 0) {
            setPasswordErrors(validationErrors);
            return;
        }

        setPasswordErrors({});
        setPasswordSubmitting(true);

        try {
            await changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });

            setMessage("✅ Password updated successfully");

            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (error) {
            console.error("Error updating password:", error);
            const status = error.response?.status;
            const errorMessage = error.response?.data?.message || "Unable to update password";

            if (status === 401) {
                setPasswordErrors((prev) => ({
                    ...prev,
                    currentPassword: errorMessage
                }));
                return;
            }

            if (status === 400 && errorMessage.toLowerCase().includes("new password")) {
                setPasswordErrors((prev) => ({
                    ...prev,
                    newPassword: errorMessage
                }));
                return;
            }

            setError(errorMessage);
        } finally {
            setPasswordSubmitting(false);
        }
    };


    /* =========================
       Loading state
    ========================= */

    if (!user) {
        return <PageLoading>Loading profile...</PageLoading>;
    }


    /* =========================
       Main render
    ========================= */

    return (
        <div className="container page-section">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Manage your personal information, password, and event participation.</p>
                </div>
            </div>

            {message && <Alert type="success">{message}</Alert>}
            {error && <Alert type="danger">{error}</Alert>}

            <div className="profile-grid">
                <Card>
                    <div className="section-header">
                        <h2 className="section-title">Profile Information</h2>
                        <p className="section-subtitle">Update your public account details.</p>
                    </div>

                    <UserProfileForm
                        form={profileForm}
                        errors={profileErrors}
                        submitting={profileSubmitting}
                        onChange={handleProfileChange}
                        onSubmit={handleProfileSubmit}
                    />
                </Card>

                <Card>
                    <div className="section-header">
                        <h2 className="section-title">Change Password</h2>
                        <p className="section-subtitle">Update your password securely.</p>
                    </div>

                    <ChangePasswordForm
                        form={passwordForm}
                        errors={passwordErrors}
                        showPasswords={showPasswords}
                        submitting={passwordSubmitting}
                        onChange={handlePasswordChange}
                        onSubmit={handlePasswordSubmit}
                        onTogglePassword={togglePasswordVisibility}
                    />
                </Card>
            </div>
        </div>
    );
}