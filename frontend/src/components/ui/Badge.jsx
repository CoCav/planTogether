import { EVENT_ROLE_UI } from "../../features/shared/constants/eventRoles";
import { EVENT_STATUS_UI } from "../../features/shared/constants/eventStatus";

/* ==================================================
   BADGE
   Displays a styled label for roles, statuses or custom variants

   Supports:
   - role-based badges
   - status-based badges
   - custom variant, label and children
   - optional decorative icon
================================================== */

export default function Badge({ role, status, variant, label, icon, children, className = "" }) {

    /* =========================
       BADGE CONFIGURATION
    ========================= */

    // Resolves role and status UI configuration
    const roleConfig = role ? EVENT_ROLE_UI[role] : null;
    const statusConfig = status ? EVENT_STATUS_UI[status] : null;

    // Resolves badge variant from explicit prop or shared UI config
    const badgeVariant =
        variant ||
        roleConfig?.badgeVariant ||
        statusConfig?.badgeVariant ||
        "";

    // Resolves badge icon from explicit prop or shared UI config
    const BadgeIcon =
        icon ||
        roleConfig?.icon ||
        statusConfig?.icon ||
        null;

    // Resolves badge label from explicit prop, children or shared UI config
    const badgeLabel =
        label ||
        children ||
        roleConfig?.label ||
        statusConfig?.label ||
        "";

    /* =========================
       SAFETY CHECK
    ========================= */

    if (!badgeLabel || !badgeVariant) {
        return null;
    }

    return (
        <span className={`badge badge-${badgeVariant} ${className}`.trim()}>
            {BadgeIcon && (
                <span className="badge-icon" aria-hidden="true">
                    <BadgeIcon />
                </span>
            )}

            <span className="badge-label">
                {badgeLabel}
            </span>
        </span>
    );
}
