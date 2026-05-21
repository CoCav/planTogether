/* ==================================================
   FORM FIELD
   Wraps a form control with label and validation error

   Supports:
   - accessible label association via htmlFor
   - accessible error association via aria-describedby
   - custom field content
   - optional error message
   - custom classes
================================================== */

export default function FormField({
    label,
    htmlFor,
    error,
    children,
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
