
export default function Button({
    children,
    variant = "primary",
    loading = false,
    disabled = false,
    className = "",
    ...props
}) {
    const isDisabled = disabled || loading;

    return (
        <button className={`btn btn-${variant} ${loading ? "is-loading" : ""} ${className}`.trim()} disabled={isDisabled} {...props}>
            {loading ? "Loading..." : children}
        </button>
    );
};