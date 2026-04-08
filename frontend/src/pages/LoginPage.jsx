import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { useAuth } from "../context/useAuth.js";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await loginUser(form);
            const token = response.data.token;

            await login(token);
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

            <div>
                 <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}/>
            </div>

            <button type="submit">Login</button>
            </form>
        </div>
    );
}