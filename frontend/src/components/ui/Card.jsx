/* ==================================================
   CARD
   Generic container used to wrap content sections

   Supports:
   - custom classes
   - forwarded DOM props
================================================== */

export default function Card({
    children,
    className = "",
    ...props
}) {
    const classes = `card ${className}`.trim();

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
}
