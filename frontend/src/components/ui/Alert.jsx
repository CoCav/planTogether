/* ==================================================
   ALERT
   Displays contextual feedback messages

   Variants:
   - info
   - success
   - danger
================================================== */

export default function Alert({ children, type = "info", className = "", role }) {
    const classes = `alert alert-${type} ${className}`.trim();

    const alertRole = role || (type === "danger" ? "alert" : "status");

    return (
        <div className={classes} role={alertRole}>
            {children}
        </div>
    );
}