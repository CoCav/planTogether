import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth.js";
import { loginUser } from "../api/authApi";
import { validateLoginForm } from "../features/auth/authValidation.js";

import AuthPasswordField from "../components/auth/AuthPasswordField.jsx";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";

/* ==================================================
   LOGIN PAGE
   Handles user authentication

   Features:
   - login form validation
   - password visibility toggle
   - remember me option
================================================== */

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Determines redirect destination after login
    const from = location.state?.from?.pathname || "/events";

    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});

    // Controls password visibility
    const [showPassword, setShowPassword] = useState(false);

    // Stores session persistence choice
    const [rememberMe, setRememberMe] = useState(false);

    // Controls submit loading state
    const [submitting, setSubmitting] = useState(false);

    // Login form state
    const [form, setForm] = useState({
        email: "",
        password: ""
    });


    /* =========================
        Form input handling
        Updates credentials and clears field errors
    ========================= */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: undefined
        }));
    };


    /* =========================
        Form submission
        Validates credentials, logs user in and redirects
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
            navigate(from, { replace: true });
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

                        <FormField label="Email" error={errors.email}>
                            <Input
                                type="email"
                                name="email"
                                placeholder="Your email"
                                value={form.email}
                                onChange={handleChange}
                                error={errors.email}
                            />
                        </FormField>

                        <AuthPasswordField
                            label="Password"
                            name="password"
                            value={form.password}
                            placeholder="Your password"
                            error={errors.password}
                            visible={showPassword}
                            onChange={handleChange}
                            onToggle={() => setShowPassword((prev) => !prev)}
                        />
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

                    <p className="auth-footer text-muted">
                        Don't have an account?{" "}
                        <Link to="/register" className="link-inline">Register</Link>
                    </p>
                </form>
            </Card>
        </div>
    );
}