import Badge from "../ui/Badge.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import Alert from "../ui/Alert.jsx";

/* ==================================================
   EVENT MEMBER LIST
   Displays event members with optional actions

   Used for:
   - event organizers / team
   - event participants / attendees
================================================== */

export default function EventMemberList({ title, subtitle, members = [], emptyMessage = "No members found.", showActions = true, headerMessage = null, renderActions }) {
    return (
        <>
            <div className="section-header">
                <h2 className="section-title">{title}</h2>
                {subtitle && <p className="section-subtitle">{subtitle}</p>}
            </div>

            {headerMessage && (
                <Alert type="info">
                    {headerMessage}
                </Alert>
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
