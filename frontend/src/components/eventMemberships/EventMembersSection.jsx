import { Link } from "react-router-dom";

import Badge from "../ui/Badge";
import EmptyState from "../ui/EmptyState";

/* ==================================================
   EVENT MEMBERS SECTION
   Displays an event members section with optional actions

   Handles:
   - section heading
   - optional contextual message
   - empty member state
   - member rows
   - public profile navigation
   - optional member actions
   - accessible section and list semantics
================================================== */

export default function EventMembersSection({
    title,
    subtitle,
    members = [],
    emptyMessage = "No members found.",
    showActions = true,
    renderActions
}) {

    /* =========================
       ACCESSIBILITY
    ========================= */

    const sectionTitleId = `${title.toLowerCase().replace(/\s+/g, "-")}-title`;

    return (
        <section aria-labelledby={sectionTitleId}>
            <div className="section-header">
                <h2 id={sectionTitleId} className="section-title">
                    {title}
                </h2>

                {subtitle && (
                    <p className="section-subtitle">{subtitle}</p>
                )}
            </div>

            {members.length === 0 ? (
                <EmptyState>{emptyMessage}</EmptyState>
            ) : (
                <div className="member-list" role="list">
                    {members.map((person) => (
                        <div key={person.id} className="member-row" role="listitem">
                            <div className="member-info">
                                <Link
                                    to={`/users/${person.id}`}
                                    className="member-name link-hover-primary"
                                >
                                    {person.name}
                                </Link>

                                <Badge role={person.role} />
                            </div>

                            {showActions && renderActions && (
                                <div className="member-actions">
                                    {renderActions(person)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
