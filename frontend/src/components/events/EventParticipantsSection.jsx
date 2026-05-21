import { formatBe, formatCount } from "../../utils/formatters";

import EventMembersSection from "./EventMembersSection";

import Button from "../ui/Button";
import Card from "../ui/Card";

/* ==================================================
   EVENT PARTICIPANTS SECTION
   Displays event participants and attendee actions

   Handles:
   - participant section copy
   - promote action
   - remove action
   - guest / past-event message
   - participant empty state
================================================== */

export default function EventParticipantsSection({
    user,
    isPast,
    participants,
    participantCount,
    canPromote,
    canRemove,
    onPromote,
    onRemove
}) {

    return (
        <Card>
            <EventMembersSection
                title={formatCount(participantCount, "Attendee")}
                subtitle={`${formatCount(participantCount, "attendee")} ${formatBe(participantCount)} attending this event.`}
                members={participants}
                emptyMessage={
                    isPast
                        ? "No one attended this event."
                        : "No participants yet."
                }
                showActions={Boolean(user)}
                headerMessage={
                    !user
                        ? isPast
                            ? "This event has ended."
                            : "🔐 Login to join this event and interact with participants."
                        : null
                }
                renderActions={(person) => (
                    <>
                        {canPromote(person) && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onPromote(person.id)}
                            >
                                Promote
                            </Button>
                        )}

                        {canRemove(person) && (
                            <Button
                                type="button"
                                variant="danger"
                                onClick={() => onRemove(person.id)}
                            >
                                Remove
                            </Button>
                        )}
                    </>
                )}
            />
        </Card>
    );
}
