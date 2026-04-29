/* ==================================================
   FORM FIELD
   Wraps a form control with label and validation error

   Supports:
   - custom field content
   - optional error message
   - custom classes
================================================== */

export default function FormField({label, error, children, className = ""}) {
    return (
        <div className={`form-field ${className}`.trim()}>
            <label className="form-label">{label}</label>

            {children}

            {error && <p className="field-error">{error}</p>}
        </div>
    );
}