import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { registerUser } from "../api/authApi";
import { validateRegisterForm } from "../features/auth/authValidation";

import AuthPasswordField from "../components/auth/AuthPasswordField";
import PasswordRequirements from "../components/auth/PasswordRequirements";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";

/* ==================================================
   REGISTER PAGE
   Allows a new user to create an account

   Handles:
   - registration form validation
   - password requirements display
   - password visibility toggle
   - automatic login after registration
================================================== */

export default function RegisterPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});

    // Controls password visibility
    const [showPassword, setShowPassword] = useState(false);

    // Controls submit loading state
    const [submitting, setSubmitting] = useState(false);

    // Registration form state
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });


    /* =========================
        Form input handling
        Updates form values and clears field errors
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
        Validates form, creates account and logs user in
    ========================= */

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const validationErrors = validateRegisterForm(form);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setSubmitting(true);

        try {
            const response = await registerUser(form);
            const token = response.data.token;

            await login(token);
            navigate("/events");
        } catch (err) {
            console.error("Register error:", err);
            setError("Unable to register. Please check your information.");
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
                    <h1 className="page-title">Register</h1>
                    <p className="page-subtitle">Create your account and start organizing events.</p>
                </div>
            </div>

            {error && <Alert type="danger">{error}</Alert>}

            <Card className="auth-card">
                <form onSubmit={handleSubmit} className="event-form">
                    <div className="auth-form-grid">

                        <FormField label="Name" error={errors.name}>
                            <Input
                                type="text"
                                name="name"
                                placeholder="Your name"
                                value={form.name}
                                onChange={handleChange}
                                error={errors.name}
                            />
                        </FormField>

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
                            placeholder="Choose a password"
                            error={errors.password}
                            visible={showPassword}
                            onChange={handleChange}
                            onToggle={() => setShowPassword((prev) => !prev)}
                        >
                            <PasswordRequirements password={form.password} />
                        </AuthPasswordField>
                    </div>

                    <div className="form-actions">
                        <Button type="submit" loading={submitting}>Register</Button>
                    </div>

                    <p className="auth-footer text-muted">
                        Already have an account?{" "}
                        <Link to="/login" className="link-inline">Login</Link>
                    </p>
                </form>
            </Card>
        </div>
    );
}