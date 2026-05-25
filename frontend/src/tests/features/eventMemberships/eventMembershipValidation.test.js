import { describe, expect, it } from "vitest";

import {
    isValidEventMemberRole,
    validateEventMemberRoleUpdate,
    validateOwnershipTransfer,
    validateTargetUserId
} from "../../../features/eventMemberships/eventMembershipValidation";

import { EVENT_ROLES, VALID_EVENT_ROLES } from "../../../features/shared/constants/eventRoles";

/* ==================================================
   EVENT MEMBERSHIP VALIDATION TESTS
   Tests event membership validation helpers

   Handles:
   - target user ID validation
   - event member role validation
   - role update validation
   - ownership transfer validation
================================================== */

describe("eventMembershipValidation", () => {

    /* =============================
       TARGET USER ID
    ============================= */

    it("should validate positive integer user IDs", () => {
        expect(validateTargetUserId(1)).toBe(true);
        expect(validateTargetUserId("2")).toBe(true);
    });

    it("should reject invalid user IDs", () => {
        expect(validateTargetUserId(0)).toBe(false);
        expect(validateTargetUserId(-1)).toBe(false);
        expect(validateTargetUserId("abc")).toBe(false);
        expect(validateTargetUserId(null)).toBe(false);
        expect(validateTargetUserId(undefined)).toBe(false);
    });

    /* =============================
       EVENT MEMBER ROLE
    ============================= */

    it("should validate supported event member roles", () => {
        VALID_EVENT_ROLES.forEach((role) => {
            expect(isValidEventMemberRole(role)).toBe(true);
        });
    });

    it("should reject unsupported event member roles", () => {
        expect(isValidEventMemberRole("admin")).toBe(false);
        expect(isValidEventMemberRole("owner")).toBe(false);
        expect(isValidEventMemberRole("")).toBe(false);
        expect(isValidEventMemberRole(null)).toBe(false);
    });

    /* =============================
       ROLE MANAGEMENT
    ============================= */

    it("should validate member role update data", () => {
        expect(
            validateEventMemberRoleUpdate({
                userId: 2,
                newRole: EVENT_ROLES.CO_ORGANIZER
            })
        ).toBe(true);
    });

    it("should reject member role update with invalid user ID", () => {
        expect(
            validateEventMemberRoleUpdate({
                userId: 0,
                newRole: EVENT_ROLES.CO_ORGANIZER
            })
        ).toBe(false);
    });

    it("should reject member role update with invalid role", () => {
        expect(
            validateEventMemberRoleUpdate({
                userId: 2,
                newRole: "admin"
            })
        ).toBe(false);
    });

    /* =============================
       OWNERSHIP TRANSFER
    ============================= */

    it("should validate ownership transfer data", () => {
        expect(validateOwnershipTransfer({
            targetUserId: 2
        })).toBe(true);
    });

    it("should reject ownership transfer when target user ID is missing", () => {
        expect(validateOwnershipTransfer({})).toBe(false);
    });

    it("should reject ownership transfer with invalid target user ID", () => {
        expect(validateOwnershipTransfer({
            targetUserId: 0
        })).toBe(false);
    });
});
