/* ==================================================
   BADGE
   Displays a styled label for roles or custom variants

   Supports:
   - role-based badges
   - custom variant and label
================================================== */

export default function Badge({ role, variant, label, children, className = "" }) {

    /* =========================
     Initialize values
       - label: displayed text
       - variant: visual style
    ========================= */
    let badgeLabel = label || children || "";
    let badgeVariant = variant || "";

    /* =========================
     Role-based configuration
       Defines default label and style
    ========================= */
    if (role) {
        switch (role) {
            case "organizer":
                badgeLabel = label || children || "👑 Organizer";
                badgeVariant = variant || "organizer";
                break;

            case "co_organizer":
                badgeLabel = label || children || "🛡️ Co-organizer";
                badgeVariant = variant || "co";
                break;

            default:
                badgeLabel = label || children || "👤 Participant";
                badgeVariant = variant || "participant";
        }
    }

    /* =========================
     Safety check
       Prevent rendering if missing data
    ========================= */
    if (!badgeLabel || !badgeVariant) return null;

    return (
        <span className={`badge badge-${badgeVariant} ${className}`.trim()}>{badgeLabel}</span>
    );
}