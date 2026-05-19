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

    const classes = `alert alert-${type} ${className}`.trim();

    /* =========================
       ACCESSIBILITY
    ========================= */

    const alertRole = role || (type === "danger" ? "alert" : "status");

    return (
        <div className={classes} role={alertRole}>
            {children}
        </div>
    );
}
