import { useState } from "react";
import { updateProfile, changePassword } from "../api/authApi";
import { useAuth } from "../context/useAuth";
import BackButton from "../components/BackButton";

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });

    const [profileForm, setProfileForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleProfileChange = (e) => {
        setProfileForm({
            ...profileForm,
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {

            await updateProfile(profileForm);
            await refreshUser();
            setMessage("✅ Profile updated successfully");

        } catch (error) {

            console.error("Error updating profile:", error);
            setError("❌ Unable to update profile");
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError("❌ New passwords do not match");
            return;
        }

        try {
            await changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });

            setMessage("✅ Password updated successfully");

            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

        } catch (error) {
            console.error("Error updating password:", error);
            setError("❌ Unable to update password");
        }
    };


    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };



    if (!user) return <p>Loading profile...</p>;

    return (
        <div>
            <BackButton fallbackPath="/" label="← Back" />

            <h1>My Profile</h1>

            {message && <p style={{ color: "green" }}>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleProfileSubmit} style={{ maxWidth: "400px" }}>
                <div style={{ marginBottom: "10px" }}>
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        style={{ display: "block", width: "100%", marginTop: "5px" }}/>
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        style={{ display: "block", width: "100%", marginTop: "5px" }}/>
                </div>

                <button type="submit">Update Profile</button>
            </form>


            <form onSubmit={handlePasswordSubmit} style={{ maxWidth: "400px" }}>
                <h2>Change password</h2>

                <div style={{ marginBottom: "10px" }}>
                    <label>Current password</label>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "5px" }}>
                          <input
                            type={showPasswords.currentPassword ? "text" : "password"}
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            style={{ flex: 1 }}/>
                        <button 
                            type="button"
                            onClick={() => togglePasswordVisibility("currentPassword")}>
                            {showPasswords.currentPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                  
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>New password</label>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "5px" }}>
                        <input
                            type={showPasswords.newPassword ? "text" : "password"}
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            style={{ flex: 1 }}/>
                        <button 
                            type="button"
                            onClick={() => togglePasswordVisibility("newPassword")}>
                            {showPasswords.newPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                   
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Confirm new password</label>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "5px" }}>
                        <input
                            type={showPasswords.confirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            style={{ flex: 1 }}/>
                        <button 
                            type="button"
                            onClick={() => togglePasswordVisibility("confirmPassword")}>
                            {showPasswords.confirmPassword ? "Hide" : "Show"}
                        </button>
                    </div>
        
                </div>

                <button type="submit">Update Password</button>
            </form>
        </div>
    );
}