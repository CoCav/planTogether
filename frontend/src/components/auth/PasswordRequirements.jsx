/* ==================================================
   PASSWORD REQUIREMENTS
   Displays live password requirements for auth forms

   Checks:
   - minimum length
   - uppercase letter
   - number
================================================== */

export default function PasswordRequirements({ password = "" }) {
    const requirements = {
        length: password.length >= 6,
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
    };

    const renderRequirement = (isValid, text) => (
        <p className={`password-rule ${isValid ? "valid" : ""}`}>
            <span className="password-rule-icon">{isValid ? "✓" : "•"}</span>
            {text}
        </p>
    );

    return (
        <div className="password-rules">
            <p className="password-rules-title">Your password must contain at least:</p>

            <div className="password-rules-row">
                {renderRequirement(requirements.length, "6 characters")}
                {renderRequirement(requirements.uppercase, "1 uppercase")}
                {renderRequirement(requirements.number, "1 number")}
            </div>
        </div>
    );
}