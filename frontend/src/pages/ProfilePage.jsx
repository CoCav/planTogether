import { useState } from "react";
import { updateProfile } from "../api/authApi";
import { useAuth } from "../context/useAuth";
import BackButton from "../components/BackButton";

export default function ProfilePage() {
    const { user, login } = useAuth();

    const [form, setForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await updateProfile(form);

            setMessage("✅ Profile updated successfully");
            console.log("Updated profile:", response.data);

        } catch (error) {
            console.error("Error updating profile:", error);
            setError("❌ Unable to update profile");
        }
    };

    if (!user) return <p>Loading profile...</p>;

    return (
        <div>
            <BackButton fallbackPath="/" label="← Back" />

            <h1>My Profile</h1>

            {message && <p style={{ color: "green" }}>{message}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ maxWidth: "400px" }}>
                <div style={{ marginBottom: "10px" }}>
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        style={{ display: "block", width: "100%", marginTop: "5px" }}/>
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        style={{ display: "block", width: "100%", marginTop: "5px" }}/>
                </div>

                <button type="submit">Update Profile</button>
            </form>
        </div>
    );
}