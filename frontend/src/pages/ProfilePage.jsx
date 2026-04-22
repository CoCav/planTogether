import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { updateProfile, changePassword } from "../api/authApi";
import { validateProfileForm, validateChangePasswordForm } from "../features/auth/authValidation";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import Input from "../components/ui/Input";
import PasswordRules from "../components/ui/PasswordRules";
import Alert from "../components/ui/Alert";

/* ==================================================
   PROFILE PAGE
   Allows the user to update profile information 
   and change their password
================================================== */
export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [profileErrors, setProfileErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});

    // Submit loading states: controls button loading UX
    const [profileSubmitting, setProfileSubmitting] = useState(false);
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);

    // Profile form state : personal information form
    const [profileForm, setProfileForm] = useState({
        name: user?.name ?? "",
        email: user?.email ?? ""
    });

    // Password form state: change password form
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    // Password visibily state: toggles show / hide password inputs
    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });


    /* =========================
     Effect
        Auto-clear feedback messages after delay
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
     Inputs handlers
    ========================= */
    
    const handleProfileChange = (e) => {
        const { name, value } = e.target;

        setProfileForm({
            ...profileForm,
            [name]: value
        });

        setProfileErrors((prev) => ({
            ...prev,
            [name]: undefined
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPasswordForm({
            ...passwordForm,
            [name]: value
        });
        setPasswordErrors((prev) => ({
            ...prev,
            [name]: undefined
        }));
    };

    // Toggles visibility of a specific password field
    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field]
        }));
    };


    /* =========================
       Form submit handlers
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

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        const validationErrors = validateChangePasswordForm(passwordForm);

        if (passwordForm.currentPassword && passwordForm.newPassword && passwordForm.currentPassword === passwordForm.newPassword) {
            validationErrors.newPassword = "New password must be different from current password";
        }
        
        if (!passwordForm.confirmPassword) {
            validationErrors.confirmPassword = "Confirm password is required";
        }

        if (passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
            validationErrors.confirmPassword = "Passwords do not match. Please check again.";
        }

        if (Object.keys(validationErrors).length > 0) {
            setPasswordErrors(validationErrors);
            return;
        }

        setPasswordErrors({});
        setPasswordSubmitting(true);

        try {
            await changePassword({currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword});
            setMessage("✅ Password updated successfully");

            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (error) {
            console.error("Error updating password:", error);
            const status = error.response?.status;
            const message = error.response?.data?.message || "Unable to update password";

            if (status === 401) {
                setPasswordErrors((prev) => ({
                    ...prev,
                    currentPassword: message
                }));
                return;
            } else if (status === 400 && message.toLowerCase().includes("new password")) {
                setPasswordErrors((prev) => ({
                    ...prev,
                    newPassword: message
                }));
                return;
            } 
            
            setError(`${message}`);

        } finally {
            setPasswordSubmitting(false);
        }
    };


    /* =========================
       Conditional rendering
    ========================= */

    if (!user) {
        return (
            <div className="container page-section">
                <LoadingState>Loading profile...</LoadingState>
            </div>
        );
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
                        <div className="form-grid">
                            <FormField label="Name">
                                <Input
                                    type="text"
                                    name="name"
                                    value={profileForm.name}
                                    onChange={handleProfileChange}
                                    placeholder="Your name"
                                    className={profileErrors.name ? "error" : ""}
                                />
                                {profileErrors.name && <p className="field-error">{profileErrors.name}</p>}
                            </FormField>

                            <FormField label="Email">
                                <Input
                                    type="email"
                                    name="email"
                                    value={profileForm.email}
                                    onChange={handleProfileChange}
                                    placeholder="Your email"
                                    className={profileErrors.email ? "error" : ""}
                                />
                                {profileErrors.email && <p className="field-error">{profileErrors.email}</p>}
                            </FormField>
                        </div>

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

                    <form onSubmit={handlePasswordSubmit} className="event-form">
                        <div className="password-fields">
                            <FormField label="Current password">
                                <div className="password-row">
                                    <Input
                                        type={showPasswords.currentPassword ? "text" : "password"}
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Current password"
                                        className={passwordErrors.currentPassword ? "error" : ""}
                                    />
                                    <Button type="button" variant="outline" onClick={() => togglePasswordVisibility("currentPassword")}>{showPasswords.currentPassword ? "Hide" : "Show"}</Button>
                                </div>
                                {passwordErrors.currentPassword && <p className="field-error">{passwordErrors.currentPassword}</p>}
                            </FormField>

                            <FormField label="New password">
                                <div className="password-row">
                                    <Input
                                        type={showPasswords.newPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="New password"
                                        className={passwordErrors.newPassword ? "error" : ""}
                                    />
                                    <Button type="button" variant="outline" onClick={() => togglePasswordVisibility("newPassword")}>{showPasswords.newPassword ? "Hide" : "Show"}</Button>
                                </div>

                                {Array.isArray(passwordErrors.newPassword) ? (
                                    <ul className="field-error-list">
                                        {passwordErrors.newPassword.map((error) => (<li key={error} className="field-error">{error}</li>))}
                                    </ul>
                                ) : (
                                    passwordErrors.newPassword && <p className="field-error">{passwordErrors.newPassword}</p>
                                )}
                                <PasswordRules password={passwordForm.newPassword}/>
                            </FormField>

                            <FormField label="Confirm new password">
                                <div className="password-row">
                                    <Input
                                        type={showPasswords.confirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Confirm new password"
                                        className={passwordErrors.confirmPassword ? "error" : ""}
                                    />
                                    <Button type="button" variant="outline" onClick={() => togglePasswordVisibility("confirmPassword")}>{showPasswords.confirmPassword ? "Hide" : "Show"}</Button>
                                </div>
                                 {passwordErrors.confirmPassword && <p className="field-error">{passwordErrors.confirmPassword}</p>}
                            </FormField>
                        </div>

                        <div className="form-actions">
                            <Button type="submit" loading={passwordSubmitting}>Update Password</Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}