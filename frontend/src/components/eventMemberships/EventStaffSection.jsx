import { Crown, ShieldMinus, UserX, UsersRound } from "lucide-react";

import { formatBe, formatCount } from "../../utils/formatters";

import EventMembersSection from "./EventMembersSection";
import MemberActionsMenu from "./MemberActionsMenu";

import Card from "../ui/Card";

/* ==================================================
   EVENT STAFF SECTION
   Displays event staff members and management actions

   Handles:
   - staff section copy
   - staff empty state
   - staff action menu configuration
   - ownership transfer action
   - demote action
   - remove action
   - decorative section icon
================================================== */

export default function EventStaffSection({
    user,

    staff,
    staffCount,

    canTransferOwnership,
    canDemote,
    canRemove,

    onTransferOwnership,
    onDemote,
    onRemove
}) {

    return (
        <Card>
            <EventMembersSection
                icon={UsersRound}
                title="Event Team"
                subtitle={`${formatCount(staffCount, "member")} ${formatBe(staffCount)} managing this event.`}
                members={staff}
                emptyMessage="No team members."
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
                                label: "Demote from team",
                                icon: ShieldMinus,
                                show: canDemote?.(person),
                                onClick: () => onDemote(person.id)
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
