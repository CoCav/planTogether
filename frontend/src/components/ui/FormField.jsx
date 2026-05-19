/* ==================================================
   FORM FIELD
   Wraps a form control with label and validation error

   Supports:
   - accessible label association via htmlFor
   - custom field content
   - optional error message
   - custom classes
================================================== */

export default function FormField({ label, htmlFor, error, children, className = "" }) {

    /* =========================
       CSS CLASSES
    ========================= */

    const fieldClasses = `form-field ${className}`.trim();

    return (
        <div className={fieldClasses}>
            <label htmlFor={htmlFor} className="form-field-label">
                {label}
            </label>

            {children}

            {error && <p className="form-field-error">{error}</p>}
        </div>
    );
}
