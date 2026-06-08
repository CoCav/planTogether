import { Eye, EyeOff } from "lucide-react";

import Button from "../ui/Button";
import FormField from "../ui/FormField";
import Input from "../ui/Input";

/* ==================================================
   PASSWORD FIELD
   Reusable password field with visibility toggle

   Handles:
   - password input rendering
   - password visibility toggle
   - accessible toggle state
   - validation error display
   - optional helper content
   - decorative toggle icon
================================================== */

export default function PasswordField({
    id,
    label,
    name,
    value,
    placeholder,

    error,

    visible,
    autoComplete,

    onChange,
    onToggle,

    children
}) {

    /* =============================
       ERROR STATE
    ============================= */

    // Multiple password errors need their own accessible description ID
    const multipleErrorId = `${id}-errors`;

    // Password requirements return multiple validation messages
    const hasMultipleErrors = Array.isArray(error);

    // FormField only handles single string errors
    const fieldError = hasMultipleErrors ? undefined : error;

    /* =============================
       MAIN RENDER
    ============================= */

    return (
        <FormField label={label} htmlFor={id} error={fieldError}>
            {(errorId) => (
                <>
                    <div className="password-field-control">
                        <Input
                            id={id}
                            type={visible ? "text" : "password"}
                            name={name}
                            value={value}
                            placeholder={placeholder}
                            onChange={onChange}
                            error={!!error}
                            autoComplete={autoComplete}
                            aria-describedby={
                                hasMultipleErrors
                                    ? multipleErrorId
                                    : errorId
                            }
                        />

                        <Button
                            type="button"
                            variant="outline"
                            className="password-field-toggle"
                            onClick={onToggle}
                            aria-label={visible ? "Hide password" : "Show password"}
                            aria-pressed={visible}
                        >
                            {visible ? (
                                <EyeOff aria-hidden="true" />
                            ) : (
                                <Eye aria-hidden="true" />
                            )}
                        </Button>
                    </div>

                    {hasMultipleErrors && (
                        <ul id={multipleErrorId} className="password-field-error-list">
                            {error.map((item) => (
                                <li key={item}>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    )}

                    {children}
                </>
            )}
        </FormField>
    );
}
