import { describe, expect, it } from "vitest";

import { getEventMembershipState } from "../../../features/eventMemberships/eventMembershipState";

import { EVENT_ROLES } from "../../../features/shared/constants/eventRoles";

import { createEvent } from "../../factories/events/eventFactory";
import { createAuthenticatedUser } from "../../factories/users/userFactory";
import {
    createCoOrganizerMember,
    createOrganizerMember,
    createParticipantMember
} from "../../factories/eventMemberships/membershipPermissionsFactory";

/* ==================================================
   EVENT MEMBERSHIP STATE TESTS
   Tests derived membership state for a single event

   Handles:
   - participant filtering
   - participant count resolution
   - staff count resolution
   - current user role resolution
   - current user membership state

   Notes:
   - uses shared test factories
   - focuses on pure derived state logic
================================================== */

describe("getEventMembershipState", () => {

    /* =============================
       TEST DATA
    ============================= */

    const user = createAuthenticatedUser({
        userId: 1
    });

    const event = createEvent({
        participantCount: 3
    });

    /* =============================
       TEST HELPERS
    ============================= */

    const getState = (props = {}) => {
        return getEventMembershipState({
            user,
            event,
            members: [],
            staff: [],
            ...props
        });
    };

    /* =============================
       PARTICIPANTS
    ============================= */

    it("should return empty participants when members list is empty", () => {
        const state = getState();

        expect(state.participants).toEqual([]);
    });

    it("should filter participant members", () => {
        const participant = createParticipantMember({
            id: 2,
            name: "Alice"
        });

        const coOrganizer = createCoOrganizerMember({
            id: 3,
            name: "Bob"
        });

        const state = getState({
            members: [
                participant,
                coOrganizer
            ]
        });

        expect(state.participants).toEqual([
            participant
        ]);
    });

    /* =============================
       COUNTS
    ============================= */

    it("should use event participant count when available", () => {
        const state = getState({
            members: [
                createParticipantMember({
                    id: 2
                })
            ]
        });

        expect(state.participantCount).toBe(3);
    });

    it("should fallback to participants length when event participant count is missing", () => {
        const state = getState({
            event: createEvent({
                participantCount: undefined
            }),
            members: [
                createParticipantMember({
                    id: 2
                }),
                createParticipantMember({
                    id: 3
                })
            ]
        });

        expect(state.participantCount).toBe(2);
    });

    it("should return staff count", () => {
        const state = getState({
            staff: [
                createOrganizerMember({
                    id: 1
                }),
                createCoOrganizerMember({
                    id: 2
                })
            ]
        });

        expect(state.staffCount).toBe(2);
    });

    /* =============================
       CURRENT USER ROLE
    ============================= */

    it("should resolve current user role from staff first", () => {
        const state = getState({
            staff: [
                createOrganizerMember({
                    id: 1
                })
            ],
            members: [
                createParticipantMember({
                    id: 1
                })
            ]
        });

        expect(state.currentUserRole).toBe(EVENT_ROLES.ORGANIZER);
    });

    it("should resolve current user role from members when not in staff", () => {
        const state = getState({
            members: [
                createParticipantMember({
                    id: 1
                })
            ]
        });

        expect(state.currentUserRole).toBe(EVENT_ROLES.PARTICIPANT);
    });

    it("should return null role when user is not a member", () => {
        const state = getState({
            staff: [
                createOrganizerMember({
                    id: 2
                })
            ],
            members: [
                createParticipantMember({
                    id: 3
                })
            ]
        });

        expect(state.currentUserRole).toBeNull();
    });

    it("should return null role when user is not authenticated", () => {
        const state = getState({
            user: null,
            staff: [
                createOrganizerMember({
                    id: 1
                })
            ],
            members: [
                createParticipantMember({
                    id: 1
                })
            ]
        });

        expect(state.currentUserRole).toBeNull();
    });

    /* =============================
       MEMBERSHIP STATE
    ============================= */

    it("should mark user as member when role exists", () => {
        const state = getState({
            members: [
                createParticipantMember({
                    id: 1
                })
            ]
        });

        expect(state.isMember).toBe(true);
    });

    it("should mark user as not member when no role exists", () => {
        const state = getState();

        expect(state.isMember).toBe(false);
    });
});
