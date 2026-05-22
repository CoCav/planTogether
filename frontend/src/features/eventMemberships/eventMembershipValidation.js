import { VALID_EVENT_ROLES } from "../shared/constants/eventRoles";

/* ==================================================
   EVENT MEMBERSHIP VALIDATION
   Provides frontend validation rules for event membership actions

   Handles:
   - member role updates
   - member removal
   - ownership transfer

   Notes:
   - aligned with backend eventMembershipValidator
   - backend remains the source of truth for security
================================================== */

/* =============================
   SHARED HELPERS
============================= */

// Checks if a user ID is valid
export const validateTargetUserId = (userId) => {
    return (
        Number.isInteger(Number(userId)) &&
        Number(userId) > 0
    );
};

// Checks if an event member role is valid
export const isValidEventMemberRole = (role) => {
    return VALID_EVENT_ROLES.includes(role);
};

/* =============================
   ROLE MANAGEMENT
============================= */

// Validates member role update data
export const validateEventMemberRoleUpdate = ({ userId, newRole }) => {
    return (
        validateTargetUserId(userId) &&
        isValidEventMemberRole(newRole)
    );
};

/* =============================
   OWNERSHIP TRANSFER
============================= */

// Validates ownership transfer data
export const validateOwnershipTransfer = ({
    targetUserId
}) => {
    return validateTargetUserId(targetUserId);
};
