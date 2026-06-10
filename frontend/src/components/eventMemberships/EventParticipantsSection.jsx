import { Crown, ShieldPlus, UserX, Users } from "lucide-react";

import { formatBe, formatCount } from "../../utils/formatters";

import EventMembersSection from "./EventMembersSection";
import MemberActionsMenu from "./MemberActionsMenu";

import Card from "../ui/Card";

/* ==================================================
   EVENT PARTICIPANTS SECTION
   Displays event participants and attendee actions

   Handles:
   - participant section copy
   - participant empty state
   - past event empty state
   - participant role badge omission
   - participant action menu configuration
   - ownership transfer action
   - promote action
   - remove action
   - decorative section icon
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
                icon={Users}
                title="Event Participants"
                subtitle={`${formatCount(participantCount, "participant")} ${formatBe(participantCount)} attending this event.`}
                members={participants}
                showRoleBadge={false}
                emptyMessage={
                    isPast
                        ? "No one attended this event."
                        : "No participants yet."
                }
                showActions={Boolean(user)}
                renderActions={(person) => (
                    <MemberActionsMenu
                        actions={[
                            {
                                label: "Transfer ownership",
                                icon: Crown,
                                show: canTransferOwnership?.(person),
                                onClick: () => onTransferOwnership(person.id)
                            },
                            {
                                label: "Promote to team",
                                icon: ShieldPlus,
                                show: canPromote?.(person),
                                onClick: () => onPromote(person.id)
                            },
                            {
                                label: "Remove from event",
                                icon: UserX,
                                show: canRemove?.(person),
                                danger: true,
                                separated: true,
                                onClick: () => onRemove(person.id)
                            }
                        ]}
                    />
                )}
            />
        </Card>
    );
}
