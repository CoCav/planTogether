import { describe, expect, it } from "vitest";

import useMembershipPermissions from "../../../../features/eventMemberships/hooks/useMembershipPermissions";

import { EVENT_ROLES } from "../../../../features/shared/eventRoles";

import {
    createCoOrganizerMember,
    createCoOrganizerStaff,
    createMembershipPermissionProps,
    createOrganizerMember,
    createOrganizerStaff,
    createParticipantMember,
    createPermissionUser
} from "../../../factories/eventMemberships/membershipPermissionsFactory";

/* ==================================================
   USE MEMBERSHIP PERMISSIONS TESTS
   Tests membership role and permission logic

   Handles:
   - current user role resolution
   - event action permissions
   - member management permissions
   - ownership transfer permissions
   - past event restrictions

   Notes:
   - uses reusable membership permission factories
================================================== */

describe("useMembershipPermissions", () => {

    const user = createPermissionUser();

    /* =============================
       TEST HELPERS
    ============================= */

    // Resolve membership permissions hook
    const usePermissions = (overrides = {}) => {
        return useMembershipPermissions(
            createMembershipPermissionProps({
                user,
                ...overrides
            })
        );
    };

    /* =============================
       ROLE RESOLUTION
    ============================= */

    it("should resolve organizer role from staff list", () => {
        const result = usePermissions({
            staff: createOrganizerStaff()
        });

        expect(result.myRole).toBe(EVENT_ROLES.ORGANIZER);
        expect(result.isMember).toBe(true);
        expect(result.isOrganizer).toBe(true);
    });

    it("should resolve participant role from members list", () => {
        const result = usePermissions({
            members: [
                createParticipantMember()
            ]
        });

        expect(result.myRole).toBe(EVENT_ROLES.PARTICIPANT);
        expect(result.isMember).toBe(true);
        expect(result.isParticipant).toBe(true);
    });

    it("should prioritize explicit currentUserRole over members and staff", () => {
        const result = usePermissions({
            currentUserRole: EVENT_ROLES.CO_ORGANIZER,

            members: [
                createParticipantMember()
            ],

            staff: createOrganizerStaff()
        });

        expect(result.myRole).toBe(EVENT_ROLES.CO_ORGANIZER);

        expect(result.isCoOrganizer).toBe(true);
        expect(result.isOrganizer).toBe(false);
    });

    it("should resolve role from staff before members", () => {
        const result = usePermissions({
            members: [
                createParticipantMember()
            ],

            staff: createOrganizerStaff()
        });

        expect(result.myRole).toBe(EVENT_ROLES.ORGANIZER);
    });

    it("should return null role when user is not a member", () => {
        const result = usePermissions({
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
        const result = usePermissions();

        expect(result.canJoin).toBe(true);
        expect(result.showJoinButton).toBe(true);
    });

    it("should prevent guest user from joining", () => {
        const result = usePermissions({
            user: null
        });

        expect(result.canJoin).toBe(false);
        expect(result.showJoinButton).toBe(false);
    });

    it("should prevent joining when event is full", () => {
        const result = usePermissions({
            isEventFull: true
        });

        expect(result.canJoin).toBe(false);
    });

    it("should prevent joining when registration is closed", () => {
        const result = usePermissions({
            isRegistrationClosed: true
        });

        expect(result.canJoin).toBe(false);
    });

    it("should allow participant to leave but not edit or delete", () => {
        const result = usePermissions({
            members: [
                createParticipantMember()
            ]
        });

        expect(result.canLeave).toBe(true);
        expect(result.canEdit).toBe(false);
        expect(result.canDelete).toBe(false);
    });

    it("should allow organizer to edit and delete but not leave", () => {
        const result = usePermissions({
            staff: createOrganizerStaff()
        });

        expect(result.canLeave).toBe(false);
        expect(result.canEdit).toBe(true);
        expect(result.canDelete).toBe(true);
    });

    it("should allow co-organizer to edit but not delete", () => {
        const result = usePermissions({
            staff: createCoOrganizerStaff()
        });

        expect(result.canLeave).toBe(true);
        expect(result.canEdit).toBe(true);
        expect(result.canDelete).toBe(false);
    });

    it("should prevent all event actions on past events", () => {
        const result = usePermissions({
            members: [
                createParticipantMember()
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
        const result = usePermissions({
            staff: createOrganizerStaff()
        });

        expect(result.canPromote(
            createParticipantMember({
                id: 2
            })
        )).toBe(true);

        expect(result.canDemote(
            createCoOrganizerMember({
                id: 2
            })
        )).toBe(true);
    });

    it("should prevent self promotion and self demotion", () => {
        const result = usePermissions({
            staff: createOrganizerStaff()
        });

        expect(result.canPromote(
            createParticipantMember({
                id: 1
            })
        )).toBe(false);

        expect(result.canDemote(
            createCoOrganizerMember({
                id: 1
            })
        )).toBe(false);
    });

    it("should allow organizer to remove participants and co-organizers", () => {
        const result = usePermissions({
            staff: createOrganizerStaff()
        });

        expect(result.canRemove(
            createParticipantMember({
                id: 2
            })
        )).toBe(true);

        expect(result.canRemove(
            createCoOrganizerMember({
                id: 3
            })
        )).toBe(true);
    });

    it("should allow co-organizer to remove participants only", () => {
        const result = usePermissions({
            staff: createCoOrganizerStaff()
        });

        expect(result.canRemove(
            createParticipantMember({
                id: 2
            })
        )).toBe(true);

        expect(result.canRemove(
            createCoOrganizerMember({
                id: 3
            })
        )).toBe(false);
    });

    it("should prevent removing yourself", () => {
        const result = usePermissions({
            staff: createOrganizerStaff()
        });

        expect(result.canRemove(
            createParticipantMember({
                id: 1
            })
        )).toBe(false);
    });

    it("should prevent removing organizer", () => {
        const result = usePermissions({
            staff: createOrganizerStaff()
        });

        expect(result.canRemove(
            createOrganizerMember({
                id: 2
            })
        )).toBe(false);
    });

    /* =============================
       OWNERSHIP TRANSFER PERMISSIONS
    ============================= */

    it("should allow organizer to transfer ownership to participant or co-organizer", () => {
        const result = usePermissions({
            staff: createOrganizerStaff()
        });

        expect(result.canTransferOwnershipTo(
            createParticipantMember({
                id: 2
            })
        )).toBe(true);

        expect(result.canTransferOwnershipTo(
            createCoOrganizerMember({
                id: 3
            })
        )).toBe(true);
    });

    it("should prevent ownership transfer to self", () => {
        const result = usePermissions({
            staff: createOrganizerStaff()
        });

        expect(result.canTransferOwnershipTo(
            createParticipantMember({
                id: 1
            })
        )).toBe(false);
    });

    it("should prevent non-organizer ownership transfer", () => {
        const result = usePermissions({
            staff: createCoOrganizerStaff()
        });

        expect(result.canTransferOwnershipTo(
            createParticipantMember({
                id: 2
            })
        )).toBe(false);
    });

    it("should prevent ownership transfer to non-members", () => {
        const result = usePermissions({
            staff: createOrganizerStaff()
        });

        expect(result.canTransferOwnershipTo({
            id: 2,
            role: null
        })).toBe(false);
    });
});
