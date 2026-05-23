/* ==================================================
   ALERT
   Displays contextual feedback messages

   Variants:
   - info
   - success
   - danger
================================================== */

export default function Alert({ children, type = "info", className = "", role }) {

    /* =========================
       CSS CLASSES
    ========================= */

    const alertClasses = `alert alert-${type} ${className}`.trim();

    /* =========================
       ACCESSIBILITY
    ========================= */

    const alertRole = role || (type === "danger" ? "alert" : "status");

    return (
        <div className={alertClasses} role={alertRole}>
            {children}
        </div>
    );
}
