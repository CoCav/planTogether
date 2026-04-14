import { useState, useEffect } from "react";
import { updateProfile, changePassword } from "../api/authApi";
import { useAuth } from "../context/useAuth";
import BackButton from "../components/BackButton";
import { getMyEvents } from "../api/eventApi";
import {  getMyEventsWithRole } from "../utils/normalize";

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [myEvents, setMyEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    const [profileForm, setProfileForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Controls visibility of password fields (show/hide toggles)
    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });

    useEffect(() => {

        // Fetches all events related to the current authenticated user
        const fetchMyEvents = async () => {
        try {

            const response = await getMyEvents();
            const normalized =  getMyEventsWithRole(response);
            setMyEvents(normalized);

        } catch (error) {
            console.error("Error loading my events:", error);
        } finally {
            setLoadingEvents(false);
        }};

    fetchMyEvents();}, []);

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

    // Toggles visibility of a specific password field
    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    // Splits events into : 
    // - created events (user is organizer)
    //- joined events (user is participant or co_organizer)
    const createdEvents = myEvents.filter((event) => event.role === "organizer");
    const joinedEvents = myEvents.filter((event) => event.role !== "organizer");

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


            <h2 style={{ marginTop: "30px" }}>My Events</h2>

            {loadingEvents ? (
                    <p>Loading events...</p>
                ) : (
                    <>
                        {/* Created Events */}
                        <div style={{ marginTop: "20px" }}>
                            <h3>Created Events</h3>

                            {createdEvents.length === 0 ? (
                                <p>No created events</p>
                            ) : (
                                <ul>
                                    {createdEvents.map((event) => (
                                    <li key={event.id}>
                                        {event.title} (Organizer)
                                    </li>))}
                                </ul>
                            )}
                        </div>

                        {/* Joined Events */}
                        <div style={{ marginTop: "20px" }}>
                            <h3>Joined Events</h3>

                            {joinedEvents.length === 0 ? (
                                <p>No joined events</p>
                            ) : (
                                <ul>
                                    {joinedEvents.map((event) => (
                                    <li key={event.id}>
                                        {event.title} ({event.role})
                                    </li>))}
                                </ul>
                            )}
                        </div>
                    </>
                )
            }

        </div>
    );
}