import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { updateProfile, changePassword } from "../api/authApi";
import { validateProfileForm, validateChangePasswordForm } from "../features/auth/authValidation";

import AuthFormFields from "../components/auth/AuthFormFields";
import ChangePasswordForm from "../components/auth/ChangePasswordForm";

import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageLoader from "../components/ui/PageLoader";

/* ==================================================
   PROFILE PAGE
   Allows the user to update profile information
   and change their password
================================================== */

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();

    /* =========================
       Local state
       Stores pages feedback, form values,
       validation errors and loadings states
    ========================= */
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [profileErrors, setProfileErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});
    const [profileSubmitting, setProfileSubmitting] = useState(false);
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);

    // Stores editable profile information
    const [profileForm, setProfileForm] = useState({
        name: user?.name ?? "",
        email: user?.email ?? "",
        avatar: null,
        currentAvatar: null
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
        Profile data sync
        Fills the form when user data is loaded or refreshed
    ========================= */
    useEffect(() => {
        if (!user) return;

        setProfileForm({
            name: user.name ?? "",
            email: user.email ?? "",
            avatar: null,
            currentAvatar: user.avatar || null
        });
    }, [user]);


    /* =========================
        Feedback cleanup
        Automatically clears success and error messages
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
    const handleChange = (e) => {
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
        Avatar input handling
        Stores selected file or removes avatar files
    ========================= */
    const handleFileChange = (e) => {
        const file = e.target.files?.[0] || null;

        setProfileForm((prev) => ({
            ...prev,
            avatar: file
        }));

        setProfileErrors((prev) => ({
            ...prev,
            avatar: undefined
        }));
    };

    const handleRemoveAvatar = () => {
        setProfileForm((prev) => ({
            ...prev,
            avatar: null,
            currentAvatar: null
        }));

        setProfileErrors((prev) => ({
            ...prev,
            avatar: undefined
        }));
    };

    /* =========================
        Password form handling
        Updates password fields, clears errors,
        and controls password visibility
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
            const formData = new FormData();

            formData.append("name", profileForm.name);
            formData.append("email", profileForm.email);

            if (profileForm.avatar) {
                formData.append("avatar", profileForm.avatar);
            }

            await updateProfile(formData);
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
        return <PageLoader>Loading profile...</PageLoader>;
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

                    <form onSubmit={handleProfileSubmit} className="event-form">

                        <AuthFormFields
                            form={profileForm}
                            errors={profileErrors}
                            onChange={handleChange}
                            onFileChange={handleFileChange}
                            onRemoveFile={handleRemoveAvatar}
                        />

                        <div className="form-actions">
                            <Button type="submit" loading={profileSubmitting}>Update Profile</Button>
                        </div>
                    </form>

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
