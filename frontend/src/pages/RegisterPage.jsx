import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../features/auth/hooks/useAuth";
import { registerUser } from "../api/auth/authApi";

import { buildRegisterFormData } from "../features/auth/registerPayloadBuilder";
import useRegisterForm from "../features/auth/hooks/useRegisterForm";

import UserForm from "../components/users/UserForm";
import PasswordField from "../components/users/PasswordField";
import PasswordRequirements from "../components/users/PasswordRequirements";

import Alert from "../components/ui/Alert";
import Card from "../components/ui/Card";

/* ==================================================
   REGISTER PAGE
   Allows a new user to create an account

   Handles:
   - register form orchestration
   - register submission
   - automatic login after registration
   - redirect after successful registration
   - accessible registration form section
================================================== */

export default function RegisterPage() {
    const { login } = useAuth();
    const navigate = useNavigate();


    /* =============================
       SUBMIT HANDLER
    ============================= */

    const handleRegister = async (values) => {
        const response = await registerUser(buildRegisterFormData(values));

        // Register endpoint returns an auth token
        const token = response.token;

        // Logs the user in immediately after account creation
        await login(token);

        // Redirects authenticated user to event listings
        navigate("/events");
    };


    /* =============================
       FORM STATE
    ============================= */

    const {
        formState,
        feedback,
        submitState,
        passwordState,
        formActions
    } = useRegisterForm({
        initialValues: {
            name: "",
            email: "",
            password: "",
            avatar: null
        },
        onSubmitValid: handleRegister
    });

    const { values, fieldErrors } = formState;
    const { error } = feedback;
    const { isSubmitting } = submitState;
    const { showPassword } = passwordState;

    const {
        handleFieldChange,
        handleAvatarChange,
        handleRemoveAvatar,
        handleTogglePassword,
        handleSubmit
    } = formActions;


    /* =============================
       MAIN RENDER
    ============================= */

    return (
        <main className="container page-section">
            <header className="page-header">
                <div className="page-header-content">
                    <h1 id="register-page-title" className="page-title">
                        Register
                    </h1>

                    <p className="page-subtitle">
                        Create your account and start organizing events.
                    </p>
                </div>
            </header>

            {error && <Alert type="danger">{error}</Alert>}

            <section className="account-section" aria-label="Registration form">
                <Card className="account-card">
                    <UserForm
                        values={values}
                        fieldErrors={fieldErrors}

                        submitLabel="Register"
                        isSubmitting={isSubmitting}

                        showAvatar

                        onFieldChange={handleFieldChange}
                        onAvatarChange={handleAvatarChange}
                        onRemoveAvatar={handleRemoveAvatar}

                        onSubmit={handleSubmit}

                        formFooter={
                            <p className="account-footer text-muted">
                                Already have an account?{" "}
                                <Link to="/login" className="link-inline">
                                    Login
                                </Link>
                            </p>
                        }
                    >
                        <div className="form-grid-column-full">
                            <PasswordField
                                id="password"
                                label="Password"
                                name="password"
                                value={values.password}
                                placeholder="Create a password"

                                error={fieldErrors.password}

                                visible={showPassword}
                                autoComplete="new-password"

                                onChange={handleFieldChange}
                                onToggle={handleTogglePassword}
                            >
                                <PasswordRequirements password={values.password} />
                            </PasswordField>
                        </div>
                    </UserForm>
                </Card>
            </section>
        </main>
    );
}
