import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../features/auth/hooks/useAuth";

import { loginUser } from "../api/auth/authApi";

import useLoginForm from "../features/auth/hooks/useLoginForm";

import LoginForm from "../components/auth/LoginForm";

import Alert from "../components/ui/Alert";
import Card from "../components/ui/Card";

/* ==================================================
   LOGIN PAGE
   Allows an existing user to sign in

   Handles:
   - login form orchestration
   - login submission
   - remember me session preference
   - redirect after successful login
   - accessible login form section
================================================== */

export default function LoginPage() {
    const { login } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();


    /* =============================
       REDIRECT STATE
    ============================= */

    // Falls back to event listings when no protected route is provided
    const from = location.state?.from?.pathname || "/events";


    /* =============================
       SUBMIT HANDLER
    ============================= */

    const handleLogin = async (values, rememberMe) => {
        const response = await loginUser(values);

        // Login endpoint returns an auth token
        const token = response.data.token;

        // Initializes authenticated session with remember me preference
        await login(token, rememberMe);

        // Redirects user to original route or fallback event listings
        navigate(from, { replace: true });
    };


    /* =============================
       FORM STATE
    ============================= */

    const {
        formState,
        feedback,
        submitState,
        passwordState,
        rememberMeState,
        formActions
    } = useLoginForm({
        initialValues: {
            email: "",
            password: ""
        },
        onSubmitValid: handleLogin
    });

    const { values, fieldErrors } = formState;
    const { error } = feedback;
    const { isSubmitting } = submitState;
    const { showPassword } = passwordState;
    const { rememberMe } = rememberMeState;

    const {
        handleFieldChange,
        handleRememberMeChange,
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
                    <h1 id="login-page-title" className="page-title">
                        Login
                    </h1>

                    <p className="page-subtitle">
                        Sign in to manage your events and participation.
                    </p>
                </div>
            </header>

            {error && <Alert type="danger">{error}</Alert>}

            <section className="account-section" aria-label="Login form">
                <Card className="account-card">
                    <LoginForm
                        values={values}
                        fieldErrors={fieldErrors}

                        submitLabel="Login"
                        isSubmitting={isSubmitting}

                        showPassword={showPassword}
                        rememberMe={rememberMe}

                        onFieldChange={handleFieldChange}
                        onRememberMeChange={handleRememberMeChange}
                        onTogglePassword={handleTogglePassword}

                        onSubmit={handleSubmit}
                    />
                </Card>
            </section>
        </main>
    );
}
