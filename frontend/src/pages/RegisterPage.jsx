import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { registerUser } from "../api/authApi";
import { validateRegisterForm } from "../features/auth/authValidation";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import FormField from "../components/ui/FormField";
import Input from "../components/ui/Input";
import PasswordRules from "../components/ui/PasswordRules";
import Alert from "../components/ui/Alert";

export default function RegisterPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});

    // Password visibility state: controls show / hide password
    const [showPassword, setShowPassword] = useState(false);

    // Submit loading state: controls register button loading
    const [submitting, setSubmitting] = useState(false);

    // Registration form state: stores user account inputs
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: ""
    });


    /* =========================
     Input change handler
        Updates form fields
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
     Register submit handler
        Creates account then logs in
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
                        <FormField label="Name">
                            <Input
                                type="text"
                                name="name"
                                placeholder="Your name"
                                value={form.name}
                                onChange={handleChange}
                                className={errors.name ? "error" : ""}
                            />
                            {errors.name && <p className="field-error">{errors.name}</p>}
                        </FormField>

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
                                    placeholder="Choose a password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className={errors.password ? "error" : ""}
                                />

                                <Button type="button" variant="outline" onClick={() => setShowPassword((prev) => !prev)}>{showPassword ? "Hide" : "Show"}</Button>
                            </div>

                            {Array.isArray(errors.password) ? (
                                <ul className="field-error-list">
                                    {errors.password.map((error) => (<li key={error} className="field-error">{error}</li>))}
                                </ul>
                            ) : (
                                errors.password && <p className="field-error">{errors.password}</p>
                            )}

                            <PasswordRules password={form.password}/>
                        </FormField>
                    </div>

                    <div className="form-actions">
                        <Button type="submit" loading={submitting}>Register</Button>
                    </div>

                    <p className="auth-footer text-muted">Already have an account?{" "} 
                        <Link to="/login" className="link-inline">Login</Link>
                    </p>
                </form>
            </Card>
        </div>
    );
}