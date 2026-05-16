import { describe, expect, it } from "vitest";

import useMembershipPermissions from "../../../../features/eventMemberships/hooks/useMembershipPermissions";

import { EVENT_ROLES } from "../../../../features/shared/eventRoles";

/* ==================================================
   USE MEMBERSHIP PERMISSIONS TESTS
   Tests membership role and permission logic

   Handles:
   - current user role resolution
   - event action permissions
   - member management permissions
   - ownership transfer permissions
   - past event restrictions
================================================== */

describe("useMembershipPermissions", () => {
    const user = { userId: 1 };

    /* =============================
       ROLE RESOLUTION
    ============================= */

    it("should resolve organizer role from staff list", () => {
        const result = useMembershipPermissions({
            user,
            staff: [
                {
                    id: 1,
                    role: EVENT_ROLES.ORGANIZER
                }
            ]
        });

        expect(result.myRole).toBe(EVENT_ROLES.ORGANIZER);
        expect(result.isMember).toBe(true);
        expect(result.isOrganizer).toBe(true);
    });

    it("should resolve participant role from members list", () => {
        const result = useMembershipPermissions({
            user,
            members: [
                {
                    id: 1,
                    role: EVENT_ROLES.PARTICIPANT
                }
            ]
        });

        expect(result.myRole).toBe(EVENT_ROLES.PARTICIPANT);
        expect(result.isMember).toBe(true);
        expect(result.isParticipant).toBe(true);
    });

    it("should return null role when user is not a member", () => {
        const result = useMembershipPermissions({
            user,
            members: [],
            staff: []
        });

        expect(result.myRole).toBeNull();
        expect(result.isMember).toBe(false);
    });

    /* =============================
       EVENT ACTION PERMISSIONS
    ============================= */

    it("should allow authenticated non-member to join", () => {
        const result = useMembershipPermissions({
            user
        });

        expect(result.canJoin).toBe(true);
        expect(result.showJoinButton).toBe(true);
    });

    it("should prevent guest user from joining", () => {
        const result = useMembershipPermissions({
            user: null
        });

        expect(result.canJoin).toBe(false);
        expect(result.showJoinButton).toBe(false);
    });

    it("should prevent joining when event is full", () => {
        const result = useMembershipPermissions({
            user,
            isEventFull: true
        });

        expect(result.canJoin).toBe(false);
    });

    it("should prevent joining when registration is closed", () => {
        const result = useMembershipPermissions({
            user,
            isRegistrationClosed: true
        });

        expect(result.canJoin).toBe(false);
    });

    it("should allow participant to leave but not edit or delete", () => {
        const result = useMembershipPermissions({
            user,
            members: [
                {
                    id: 1,
                    role: EVENT_ROLES.PARTICIPANT
                }
            ]
        });

        expect(result.canLeave).toBe(true);
        expect(result.canEdit).toBe(false);
        expect(result.canDelete).toBe(false);
    });

    it("should allow organizer to edit and delete but not leave", () => {
        const result = useMembershipPermissions({
            user,
            staff: [
                {
                    id: 1,
                    role: EVENT_ROLES.ORGANIZER
                }
            ]
        });

        expect(result.canLeave).toBe(false);
        expect(result.canEdit).toBe(true);
        expect(result.canDelete).toBe(true);
    });

    it("should allow co-organizer to edit but not delete", () => {
        const result = useMembershipPermissions({
            user,
            staff: [
                {
                    id: 1,
                    role: EVENT_ROLES.CO_ORGANIZER
                }
            ]
        });

        expect(result.canLeave).toBe(true);
        expect(result.canEdit).toBe(true);
        expect(result.canDelete).toBe(false);
    });

    it("should prevent all event actions on past events", () => {
        const result = useMembershipPermissions({
            user,
            members: [
                {
                    id: 1,
                    role: EVENT_ROLES.PARTICIPANT
                }
            ],
            isPast: true
        });

        expect(result.canJoin).toBe(false);
        expect(result.canLeave).toBe(false);
        expect(result.canEdit).toBe(false);
        expect(result.canDelete).toBe(false);
    });

    /* =============================
       MEMBER MANAGEMENT PERMISSIONS
    ============================= */

    it("should allow organizer to promote participants and demote co-organizers", () => {
        const result = useMembershipPermissions({
            user,
            staff: [
                {
                    id: 1,
                    role: EVENT_ROLES.ORGANIZER
                }
            ]
        });

        expect(result.canPromote({
            id: 2,
            role: EVENT_ROLES.PARTICIPANT
        })).toBe(true);

        expect(result.canDemote({
            id: 2,
            role: EVENT_ROLES.CO_ORGANIZER
        })).toBe(true);
    });

    it("should prevent self promotion and self demotion", () => {
        const result = useMembershipPermissions({
            user,
            staff: [
                {
                    id: 1,
                    role: EVENT_ROLES.ORGANIZER
                }
            ]
        });

        expect(result.canPromote({
            id: 1,
            role: EVENT_ROLES.PARTICIPANT
        })).toBe(false);

        expect(result.canDemote({
            id: 1,
            role: EVENT_ROLES.CO_ORGANIZER
        })).toBe(false);
    });

    it("should allow organizer to remove participants and co-organizers", () => {
        const result = useMembershipPermissions({
            user,
            staff: [
                {
                    id: 1,
                    role: EVENT_ROLES.ORGANIZER
                }
            ]
        });

        expect(result.canRemove({
            id: 2,
            role: EVENT_ROLES.PARTICIPANT
        })).toBe(true);

        expect(result.canRemove({
            id: 3,
            role: EVENT_ROLES.CO_ORGANIZER
        })).toBe(true);
    });

    it("should allow co-organizer to remove participants only", () => {
        const result = useMembershipPermissions({
            user,
            staff: [
                {
                    id: 1,
                    role: EVENT_ROLES.CO_ORGANIZER
                }
            ]
        });

        expect(result.canRemove({
            id: 2,
            role: EVENT_ROLES.PARTICIPANT
        })).toBe(true);

        expect(result.canRemove({
            id: 3,
            role: EVENT_ROLES.CO_ORGANIZER
        })).toBe(false);
    });

    it("should prevent removing yourself", () => {
        const result = useMembershipPermissions({
            user,
            staff: [
                {
                    id: 1,
                    role: EVENT_ROLES.ORGANIZER
                }
            ]
        });

        expect(result.canRemove({
            id: 1,
            role: EVENT_ROLES.PARTICIPANT
        })).toBe(false);
    });

    it("should prevent removing organizer", () => {
        const result = useMembershipPermissions({
            user,
            staff: [
                {
                    id: 1,
                    role: EVENT_ROLES.ORGANIZER
                }
            ]
        });

        expect(result.canRemove({
            id: 2,
            role: EVENT_ROLES.ORGANIZER
        })).toBe(false);
    });

    /* =============================
       OWNERSHIP TRANSFER PERMISSIONS
    ============================= */

    it("should allow organizer to transfer ownership to participant or co-organizer", () => {
        const result = useMembershipPermissions({
            user,
            staff: [
                {
                    id: 1,
                    role: EVENT_ROLES.ORGANIZER
                }
            ]
        });

        expect(result.canTransferOwnershipTo({
            id: 2,
            role: EVENT_ROLES.PARTICIPANT
        })).toBe(true);

        expect(result.canTransferOwnershipTo({
            id: 3,
            role: EVENT_ROLES.CO_ORGANIZER
        })).toBe(true);
    });

    it("should prevent ownership transfer to self", () => {
        const result = useMembershipPermissions({
            user,
            staff: [
                {
                    id: 1,
                    role: EVENT_ROLES.ORGANIZER
                }
            ]
        });

        expect(result.canTransferOwnershipTo({
            id: 1,
            role: EVENT_ROLES.PARTICIPANT
        })).toBe(false);
    });

    it("should prevent non-organizer ownership transfer", () => {
        const result = useMembershipPermissions({
            user,
            staff: [
                {
                    id: 1,
                    role: EVENT_ROLES.CO_ORGANIZER
                }
            ]
        });

        expect(result.canTransferOwnershipTo({
            id: 2,
            role: EVENT_ROLES.PARTICIPANT
        })).toBe(false);
    });

    it("should prevent ownership transfer to non-members", () => {
        const result = useMembershipPermissions({
            user,
            staff: [
                {
                    id: 1,
                    role: EVENT_ROLES.ORGANIZER
                }
            ]
        });

        expect(result.canTransferOwnershipTo({
            id: 2,
            role: null
        })).toBe(false);
    });
});
