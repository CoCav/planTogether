/* ==================================================
  EVENT MEMBERSHIP VALIDATION
  Provides frontend validation rules for event membership actions

  Handles:
  - member role updates
  - member removal
  - ownership transfer
================================================== */

export const EVENT_MEMBER_ROLES = [
    "organizer",
    "co_organizer",
    "participant"
];

export const isValidEventMemberRole = (role) =>
    EVENT_MEMBER_ROLES.includes(role);

export const validateTargetUserId = (userId) =>
    Number.isInteger(Number(userId)) &&
    Number(userId) > 0;

export const validateEventMemberRoleUpdate = ({ userId, newRole }) => {
    return (
        validateTargetUserId(userId) &&
        isValidEventMemberRole(newRole)
    );
};

export const validateOwnershipTransfer = ({ targetUserId }) => {
    return validateTargetUserId(targetUserId);
};
