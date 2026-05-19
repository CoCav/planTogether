import Alert from "../ui/Alert";
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
   - optional member actions
================================================== */

export default function EventMembersSection({
    title,
    subtitle,
    members = [],
    emptyMessage = "No members found.",
    showActions = true,
    headerMessage = null,
    renderActions
}) {

    return (
        <>
            <div className="section-header">
                <h2 className="section-title">{title}</h2>

                {subtitle && (
                    <p className="section-subtitle">{subtitle}</p>
                )}
            </div>

            {headerMessage && (
                <Alert type="info">{headerMessage}</Alert>
            )}

            {members.length === 0 ? (
                <EmptyState>{emptyMessage}</EmptyState>
            ) : (
                <div className="member-list">
                    {members.map((person) => (
                        <div key={person.id} className="member-row">
                            <div className="member-info">
                                <span className="member-name">{person.name}</span>

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
        </>
    );
}
