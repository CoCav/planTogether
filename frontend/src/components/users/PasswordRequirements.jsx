import { PASSWORD_REQUIREMENTS, PASSWORD_REQUIREMENT_LABELS } from "../../features/shared/security/passwordPolicy";

/* ==================================================
   PASSWORD REQUIREMENTS
   Displays live password validation requirements

   Handles:
   - password requirement rendering
   - valid requirement state display
   - accessible requirement list semantics
   - decorative validation icons
================================================== */

export default function PasswordRequirements({ password = "" }) {

    /* =============================
       REQUIREMENT STATE
    ============================= */

    const requirements = [
        {
            id: "minLength",
            label: PASSWORD_REQUIREMENT_LABELS.minLength,
            isValid:
                password.length >= PASSWORD_REQUIREMENTS.minLength
        },
        {
            id: "uppercase",
            label: PASSWORD_REQUIREMENT_LABELS.uppercase,
            isValid:
                PASSWORD_REQUIREMENTS.hasUppercase.test(password)
        },
        {
            id: "lowercase",
            label: PASSWORD_REQUIREMENT_LABELS.lowercase,
            isValid:
                PASSWORD_REQUIREMENTS.hasLowercase.test(password)
        },
        {
            id: "number",
            label: PASSWORD_REQUIREMENT_LABELS.number,
            isValid:
                PASSWORD_REQUIREMENTS.hasNumber.test(password)
        }
    ];


    /* =============================
       MAIN RENDER
    ============================= */

    return (
        <div className="password-requirements">
            <p className="password-requirements-title">
                Your password must contain at least:
            </p>

            <ul className="password-requirements-list">
                {requirements.map((requirement) => (
                    <li
                        key={requirement.id}
                        className={`password-requirement ${requirement.isValid ? "is-valid" : ""}`}
                    >
                        <span className="password-requirement-icon" aria-hidden="true">
                            {requirement.isValid ? "✓" : "•"}
                        </span>

                        {requirement.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}
