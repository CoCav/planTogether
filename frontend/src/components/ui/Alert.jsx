/* ==================================================
   ALERT COMPONENT
   Displays contextual messages (info, success, error)
================================================== */
export default function Alert({ children, type = "info", className = "" }) {

    /* =========================
       Compute CSS classes
       - Base alert styles
       - Type-based variant
    ========================= */
    const classes = `alert alert-${type} ${className}`.trim();

    /* =========================
       Render alert message
    ========================= */
    return <div className={classes}>{children}</div>

}