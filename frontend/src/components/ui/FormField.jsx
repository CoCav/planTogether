/* ==================================================
   FORM FIELD COMPONENT
   Wraps a form control with its associated label
================================================== */
export default function FormField({ label, children, className = "" }) {

    /* =========================
       Render form field
       - Applies base field layout
       - Displays label above the control
       - Renders any input, textarea or custom child
    ========================= */
    return (
        <div className={`form-field ${className}`.trim()}>
            <label className="form-label">{label}</label>
            {children}
        </div>
    );
}