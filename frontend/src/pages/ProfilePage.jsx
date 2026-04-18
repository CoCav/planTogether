import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { updateProfile, changePassword } from "../api/authApi";
import { getMyEvents } from "../api/eventMembershipApi";
import { getMyEventsWithRole } from "../utils/normalize";
import useEventActionsWithConfirm from "../hooks/useEventActionsWithConfirm";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import FormField from "../components/ui/FormField";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import Badge from "../components/ui/Badge";

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Events state: stores all user-related events
    const [myEvents, setMyEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

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

    // Derived event collection : split events by role
    const createdEvents = myEvents.filter((event) => event.role === "organizer");
    const joinedEvents = myEvents.filter((event) => event.role !== "organizer");


    /* =========================
        Data loading functions
    ========================= */

    // Fetches all events related to the current authenticated user
    const fetchMyEvents = async () => {
        try {
            setLoadingEvents(true);

            const response = await getMyEvents();
            const normalizedEvents =  getMyEventsWithRole(response);
            setMyEvents(normalizedEvents);

        } catch (error) {
            console.error("Error loading my events:", error);
        } finally {
            setLoadingEvents(false);
    }};


    /* =========================
        Effects
    ========================= */

    // Load user events on page mount
    useEffect(() => { fetchMyEvents()}, []);

    // Auto-clear feedback messages after delay
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
        Helpers
    ========================= */
    const getRoleByEventId = (eventId) => myEvents.find((event) => event.id === eventId)?.role || null;
    const {handleLeaveEvent } = useEventActionsWithConfirm({loadData : fetchMyEvents, setMessage, setError, getRoleByEventId});


    /* =========================
        Inputs handlers
    ========================= */

    const handleProfileChange = (e) => {
        setProfileForm({
            ...profileForm,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value
        });
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

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError("❌ New passwords do not match");
            return;
        }

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
            setError("❌ Unable to update password");
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
                                />
                            </FormField>

                            <FormField label="Email">
                                <Input
                                    type="email"
                                    name="email"
                                    value={profileForm.email}
                                    onChange={handleProfileChange}
                                    placeholder="Your email"
                                />
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
                                    />
                                    <Button type="button" variant="outline" onClick={() => togglePasswordVisibility("currentPassword")}>{showPasswords.currentPassword ? "Hide" : "Show"}</Button>
                                </div>
                            </FormField>

                            <FormField label="New password">
                                <div className="password-row">
                                    <Input
                                        type={showPasswords.newPassword ? "text" : "password"}
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="New password"
                                    />
                                    <Button type="button" variant="outline" onClick={() => togglePasswordVisibility("newPassword")}>{showPasswords.newPassword ? "Hide" : "Show"}</Button>
                                </div>
                            </FormField>

                            <FormField label="Confirm new password">
                                <div className="password-row">
                                    <Input
                                        type={showPasswords.confirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Confirm new password"
                                    />
                                    <Button type="button" variant="outline" onClick={() => togglePasswordVisibility("confirmPassword")}>{showPasswords.confirmPassword ? "Hide" : "Show"}</Button>
                                </div>
                            </FormField>
                        </div>

                        <div className="form-actions">
                            <Button type="submit" loading={passwordSubmitting}>Update Password</Button>
                        </div>
                    </form>
                </Card>
            </div>

            <div className="details-sections">
                <Card>
                    <div className="section-header">
                        <h2 className="section-title">My Events</h2>
                        <p className="section-subtitle">Events you created or joined.</p>
                    </div>

                    {loadingEvents ? (
                        <LoadingState>Loading events...</LoadingState>
                    ) : (
                        <div className="profile-events-grid">
                            <div>
                                <h3 className="subsection-title">Created Events</h3>

                                {createdEvents.length === 0 ? (
                                    <EmptyState>No created events.</EmptyState>
                                ) : (
                                    <div className="member-list">
                                        {createdEvents.map((event) => (
                                            <div key={event.id} className="member-row">
                                                <div className="member-info">
                                                    <Link to={`/events/${event.id}`} className="event-title-link">
                                                        <span className="member-name">{event.title}</span>
                                                    </Link>
                                                    <Badge role="organizer" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="subsection-title">Joined Events</h3>

                                {joinedEvents.length === 0 ? (
                                    <EmptyState>No joined events.</EmptyState>
                                ) : (
                                    <div className="member-list">
                                        {joinedEvents.map((event) => (
                                            <div key={event.id} className="member-row">
                                                <div className="member-info">
                                                    <Link to={`/events/${event.id}`} className="event-title-link">
                                                        <span className="member-name">{event.title}</span>
                                                    </Link>
                                                    <Badge role={event.role} />
                                                </div>

                                                <div className="member-actions">
                                                    <Button type="button" variant="outline" onClick={() => handleLeaveEvent(event.id)}>Leave</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}