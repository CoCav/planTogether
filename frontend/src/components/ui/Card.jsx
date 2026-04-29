/* ==================================================
   CARD
   Generic container used to wrap content sections

   Supports:
   - custom classes
   - forwarded DOM props
================================================== */

export default function Card({ children, className = "", ...props }) {

    /* =========================
       Render card container
       - Applies base "card" styles
       - Merges optional custom classes
       - Forwards all additional props
    ========================= */
    return (
        <div className={`card ${className}`.trim()} {...props}>{children}</div>
    );
}