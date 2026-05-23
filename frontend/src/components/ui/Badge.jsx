import { EVENT_ROLE_UI } from "../../features/shared/constants/eventRoles";

/* ==================================================
   BADGE
   Displays a styled label for roles or custom variants

   Supports:
   - role-based badges
   - custom variant and label
================================================== */

export default function Badge({ role, variant, label, children, className = "" }) {

    /* =========================
       ROLE CONFIGURATION
    ========================= */

    const roleConfig = role ? EVENT_ROLE_UI[role] : null;

    const badgeVariant =
        variant ||
        roleConfig?.badgeVariant ||
        "";

    const badgeLabel =
        label ||
        children ||
        roleConfig?.label ||
        "";

    /* =========================
       SAFETY CHECK
    ========================= */

    if (!badgeLabel || !badgeVariant) {
        return null;
    }

    return (
        <span className={`badge badge-${badgeVariant} ${className}`.trim()}>
            {badgeLabel}
        </span>
    );
}
