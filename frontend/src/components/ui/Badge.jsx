
/* ==================================================
   BADGE COMPONENT
    Displays a styled label based on user role or custom variant
        Supports both:
        - role-based badges (organizer, participant, etc.)
        - custom badges via variant + label/children
================================================== */

export default function Badge({
    role,
    variant,
    label,
    children,
    className = "",
}) {
    // Default values: initialize label and variant
    let badgeLabel = label || children || "";
    let badgeVariant = variant || "";

    // Role-based configuration: if a role is provided, define default label and style
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

    // Safety check: prevent rendering if label or variant is missing
    if (!badgeLabel || !badgeVariant) return null;

    return (
        <span className={`badge badge-${badgeVariant} ${className}`.trim()}>
            {badgeLabel}
        </span>
    );
}