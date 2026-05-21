/* ==================================================
   BUTTON
   Reusable button with variants and loading state

   Supports:
   - visual variants
   - disabled state
   - loading state
   - accessible busy state
   - forwarded button props
================================================== */

export default function Button({
    children,
    type = "button",
    variant = "primary",
    loading = false,
    disabled = false,
    className = "",
    ...props
}) {

    const classes = `btn btn-${variant} ${className}`.trim();

    const isDisabled = disabled || loading;

    return (
        <button
            type={type}
            className={classes}
            disabled={isDisabled}
            aria-busy={loading}
            {...props}
        >
            {loading ? "Loading..." : children}
        </button>
    );
}
