/* ==================================================
   BUTTON COMPONENT
   Reusable button supporting multiple variants
   (primary, outline, danger, etc.)
================================================== */
export default function Button({children, type = "button", variant = "primary", loading = false, disabled = false, className = "", ...props }) {

    /* =========================
       Compute CSS classes
       - Base button styles
       - Variant-based styling
       - Optional custom classes
    ========================= */
    const classes = `btn btn-${variant} ${className}`.trim();

    /* =========================
       Derived state
       - Disable button when loading
    ========================= */
    const isDisabled = disabled || loading;

    /* =========================
       Render button
        Forwards additional props except "loading"
    ========================= */
    return <button type={type} className={classes} disabled={isDisabled} {...props}>{loading ? "Loading..." : children}</button>
}