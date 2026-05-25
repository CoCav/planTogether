import { formatBe, formatCount } from "../../utils/formatters";

import EventMembersSection from "./EventMembersSection";

import Button from "../ui/Button";
import Card from "../ui/Card";

/* ==================================================
   EVENT STAFF SECTION
   Displays event staff members and management actions

   Handles:
   - staff section copy
   - ownership transfer action
   - demote action
   - remove action
   - staff empty state
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
                title="Event Team"
                subtitle={`${formatCount(staffCount, "member")} ${formatBe(staffCount)} managing this event.`}
                members={staff}
                emptyMessage="No team members."
                showActions={Boolean(user)}
                renderActions={(person) => (
                    <>
                        {canTransferOwnership?.(person) && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onTransferOwnership(person.id)}
                            >
                                Transfer ownership
                            </Button>
                        )}

                        {canDemote(person) && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onDemote(person.id)}
                            >
                                Demote
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
