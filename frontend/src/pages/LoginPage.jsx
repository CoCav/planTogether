import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import { loginUser } from "../api/authApi";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    // Controls whether the user wants to persist the session after closing the browser
    const [rememberMe, setRememberMe] = useState(false);

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // Handles login request
    // Stores token depending on 'Remember me' option
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await loginUser(form);
            const token = response.data.token;

            await login(token, rememberMe);
            navigate("/events");
        } catch {
            setError("Invalid email or password");
        }
    };

    return (
        <div>
            <h1>Login</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}/>
                </div>

            <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    style={{ marginRight: "10px" }}
                    />

                <button 
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? "Hide" : "Show"}
                </button>
            </div>

            <div style={{ marginBottom: "10px" }}>
                <label>
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ marginRight: "5px" }}/>
                        Remember me
                </label>
            </div>

            <button type="submit">Login</button>
            </form>

            <div style={{ marginBottom: "10px" }}>

</div>
        </div>
    );
}