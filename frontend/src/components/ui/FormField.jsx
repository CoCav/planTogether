/* ==================================================
   FORM FIELD
   Wraps a form control with label and validation error

   Supports:
   - accessible label association via htmlFor
   - accessible error association via aria-describedby
   - optional field indicator
   - custom field content
   - validation error display
   - custom classes
================================================== */

export default function FormField({
    label,
    htmlFor,
    error,
    children,
    optional = false,
    className = ""
}) {

    /* =========================
       ACCESSIBILITY
    ========================= */

    const errorId = error ? `${htmlFor}-error` : undefined;

    /* =========================
       CSS CLASSES
    ========================= */

    const fieldClasses = `form-field ${className}`.trim();

    return (
        <div className={fieldClasses}>
            <label htmlFor={htmlFor} className="form-field-label">
                {label}

                {optional && (
                    <span className="form-field-optional">
                        (Optional)
                    </span>
                )}
            </label>

            {children(errorId)}

            {error && (
                <p id={errorId} className="form-field-error">
                    {error}
                </p>
            )}
        </div>
    );
}
