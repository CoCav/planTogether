/* ==================================================
   FORM FIELD
   Wraps a form control with label and validation error

   Supports:
   - accessible label association via htmlFor
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
    return (
        <div className={`form-field ${className}`.trim()}>
            <label htmlFor={htmlFor} className="form-label">
                {label}
            </label>

            {children}

            {error && <p className="field-error">{error}</p>}
        </div>
    );
}
