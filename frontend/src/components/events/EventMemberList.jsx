import Badge from "../ui/Badge.jsx";
import EmptyState from "../ui/EmptyState.jsx";

/* ==================================================
   EVENT MEMBER LIST
   Displays event members with optional actions

   Used for:
   - event organizers / team
   - event participants / attendees
================================================== */

export default function EventMemberList({ title, subtitle, members = [], emptyMessage = "No members found.", showActions = true, renderActions }) {
    return (
        <>
            <div className="section-header">
                <h2 className="section-title">{title}</h2>
                {subtitle && <p className="section-subtitle">{subtitle}</p>}
            </div>

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