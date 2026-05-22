import { EVENT_ROLES } from "../shared/constants/eventRoles";

/* ==================================================
   EVENT MEMBERSHIP STATE
   Builds membership-related state for a single event

   Handles:
   - participant filtering
   - participant and staff counts
   - current user role resolution
   - current user membership state
================================================== */

export function getEventMembershipState({
    user,
    event,
    members = [],
    staff = []
}) {

    const participants = members.filter(
        (person) => person.role === EVENT_ROLES.PARTICIPANT
    );

    const participantCount =
        event?.participantCount ?? participants.length;

    const staffCount = staff.length;

    const currentUserRole =
        staff.find((person) => person.id === user?.userId)?.role ||
        members.find((person) => person.id === user?.userId)?.role ||
        null;

    const isMember = Boolean(currentUserRole);

    return {
        participants,
        participantCount,
        staffCount,
        currentUserRole,
        isMember
    };
}
