/* ==================================================
   PASSWORD RULES COMPONENT
   Displays password requirements with live validation
================================================== */
export default function PasswordRules({ password = "" }) {

    /* =========================
       Validation checks
    ========================= */
    const checks = {
        length: password.length >= 6,
        number: /\d/.test(password),
        uppercase: /[A-Z]/.test(password),
    };

    /* =========================
       Helper renderer
    ========================= */
    const renderRule = (isValid, text) => (
        <p className={`password-rule ${isValid ? "valid" : ""}`}>
            <span className="password-rule-icon">{isValid ? "✓" : "•"}</span>
            {text}
        </p>
    );

    /* =========================
       Render rules
    ========================= */
    return (
        <div className="password-rules">
            <p className="password-rules-title">Your password must contain at least :</p>

            <div className="password-rules-row">
                {renderRule(checks.length, "6 Characters")}
                {renderRule(checks.uppercase, "1 Uppercase")}
                {renderRule(checks.number, "1 Number")}
            </div>
        </div>
    );
}