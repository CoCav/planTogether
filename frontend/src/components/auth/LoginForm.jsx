import { Link } from "react-router-dom";

import PasswordField from "../users/PasswordField";

import Button from "../ui/Button";
import FormField from "../ui/FormField";
import Input from "../ui/Input";

/* ==================================================
   LOGIN FORM
   Displays the authentication login form

   Handles:
   - email field rendering
   - password field rendering
   - remember me state
   - login form submission
   - account navigation footer
   - accessible form field associations
================================================== */

export default function LoginForm({
    values,
    fieldErrors,

    submitLabel = "Login",
    isSubmitting,

    showPassword,
    rememberMe,

    onFieldChange,
    onRememberMeChange,
    onTogglePassword,

    onSubmit
}) {

    /* =============================
       MAIN RENDER
    ============================= */

    return (
        <form onSubmit={onSubmit} className="account-form">
            <div className="form-grid">

                <div className="form-grid-column-full">
                    <FormField label="Email" htmlFor="email" error={fieldErrors.email}>
                        {(errorId) => (
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={values.email}
                                placeholder="e.g. john@example.com"
                                onChange={onFieldChange}
                                error={!!fieldErrors.email}
                                autoComplete="email"
                                aria-describedby={errorId}
                            />
                        )}
                    </FormField>
                </div>

                <div className="form-grid-column-full">
                    <PasswordField
                        id="password"
                        label="Password"
                        name="password"
                        value={values.password}
                        placeholder="Enter your password"

                        error={fieldErrors.password}

                        visible={showPassword}
                        autoComplete="current-password"

                        onChange={onFieldChange}
                        onToggle={onTogglePassword}
                    />
                </div>

                <div className="form-grid-column-full">
                    <label className="login-form-checkbox" htmlFor="remember-me">
                        <input
                            id="remember-me"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={onRememberMeChange}
                        />

                        <span>Remember me</span>
                    </label>
                </div>

            </div>

            <div className="form-actions">
                <Button type="submit" loading={isSubmitting}>
                    {submitLabel}
                </Button>
            </div>

            <p className="account-footer text-muted">
                Don’t have an account?{" "}

                <Link to="/register" className="link-inline">
                    Register
                </Link>
            </p>
        </form>
    );
}
