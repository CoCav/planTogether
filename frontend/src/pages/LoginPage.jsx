import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import { loginUser } from "../api/authApi";
import { validateLoginForm } from "../features/auth/authValidation.js";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});

    // Password visibility state: controls show / hide password
    const [showPassword, setShowPassword] = useState(false);

    // Session persistance state: stores token in localStorage when "Remember me" is enabled
    const [rememberMe, setRememberMe] = useState(false);

    // Submit loading state: controls login button loading
    const [submitting, setSubmitting] = useState(false);

    // Login form state: user credentials input
    const [form, setForm] = useState({
        email: "",
        password: ""
    });


    /* =========================
     Input change handler
        Updates email / password
    ========================= */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value
        });

        setErrors((prev) => ({
            ...prev,
            [name]: undefined
        }));
    };


    /* =========================
     Login submit handler
        Authenticates user and stores
        token depending on rememberMe
    ========================= */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const validationErrors = validateLoginForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setSubmitting(true);

        try {
            const response = await loginUser(form);
            const token = response.data.token;

            await login(token, rememberMe);
            navigate("/events");
        } catch {
            setError("Unable to login. Please check your credentials.");
        } finally {
            setSubmitting(false);
        }
    };

    
    /* =========================
       Main render
    ========================= */

    return (
        <div className="container page-section">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Login</h1>
                    <p className="page-subtitle">Sign in to manage your events and participation.</p>
                </div>
            </div>

            {error && <Alert type="danger">{error}</Alert>}

            <Card className="auth-card">
                <form onSubmit={handleSubmit} className="event-form">
                    <div className="auth-form-grid">
                        <FormField label="Email">
                            <Input
                                type="email"
                                name="email"
                                placeholder="Your email"
                                value={form.email}
                                onChange={handleChange}
                                className={errors.email ? "error" : ""}
                            />
                            {errors.email && <p className="field-error">{errors.email}</p>}
                        </FormField>

                        <FormField label="Password">
                            <div className="password-row">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Your password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className={errors.password ? "error" : ""}
                                />

                                <Button type="button" variant="outline" onClick={() => setShowPassword((prev) => !prev)}>{showPassword ? "Hide" : "Show"}</Button>
                            </div>
                            {errors.password && <p className="field-error">{errors.password}</p>}
                        </FormField>
                    </div>

                    <label className="checkbox-row">
                        <input
                            type="checkbox"
                           checked={rememberMe}
                           onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span>Remember me</span>
                    </label>

                    <div className="form-actions">
                        <Button type="submit" loading={submitting}>Login</Button>
                    </div>

                    <p className="auth-footer text-muted">Don't have an account?{" "}
                        <Link to="/register" className="link-inline">Register</Link>
                    </p>
                </form>
            </Card>
        </div>
    );
}