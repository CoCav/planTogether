import { Crown, ShieldPlus, UserX } from "lucide-react";

import { formatBe, formatCount } from "../../utils/formatters";

import EventMembersSection from "./EventMembersSection";

import Button from "../ui/Button";
import Card from "../ui/Card";

/* ==================================================
   EVENT PARTICIPANTS SECTION
   Displays event participants and attendee actions

   Handles:
   - participant section copy
   - ownership transfer action
   - promote action
   - remove action
   - participant empty state
   - past event empty state
   - decorative action icons
================================================== */

export default function EventParticipantsSection({
    user,

    isPast,

    participants,
    participantCount,

    canTransferOwnership,
    canPromote,
    canRemove,

    onTransferOwnership,
    onPromote,
    onRemove
}) {

    return (
        <Card>
            <EventMembersSection
                title="Event Participants"
                subtitle={`${formatCount(participantCount, "participant")} ${formatBe(participantCount)} attending this event.`}
                members={participants}
                emptyMessage={
                    isPast
                        ? "No one attended this event."
                        : "No participants yet."
                }
                showActions={Boolean(user)}

                renderActions={(person) => (
                    <>
                        {canTransferOwnership?.(person) && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onTransferOwnership(person.id)}
                            >
                                <Crown aria-hidden="true" />
                                Transfer ownership
                            </Button>
                        )}

                        {canPromote(person) && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onPromote(person.id)}
                            >
                                <ShieldPlus aria-hidden="true" />
                                Promote
                            </Button>
                        )}

                        {canRemove(person) && (
                            <Button
                                type="button"
                                variant="danger"
                                onClick={() => onRemove(person.id)}
                            >
                                <UserX aria-hidden="true" />
                                Remove
                            </Button>
                        )}
                    </>
                )}
            />
        </Card>
    );
}
