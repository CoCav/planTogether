import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { registerUser } from "../api/authApi";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await registerUser(form);
            const token = response.data.token;

            await login(token);
            navigate("/events");
        } catch (err) {
            console.error("Register error:", err);
            setError("Unable to register. Please check your information.");
        }
    };

     return (
        <div>
            <h1>Register</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={form.name}
                        onChange={handleChange}/>
                </div>

                <div>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}/>
                </div>

                <div>
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}/>

                    <button 
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        style={{ marginLeft: "10px" }}>
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>

                <button type="submit">Register</button>
            </form>

            <p>Already have an account? <a href="/login">Login</a></p>
        </div>
    );
}