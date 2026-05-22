
import { describe, expect, it } from "vitest";

import { buildMembershipMap, getCurrentUserEventRole } from "../../../features/eventMemberships/eventMembershipRoles";

import { EVENT_ROLES } from "../../../features/shared/constants/eventRoles";

/* ==================================================
   EVENT MEMBERSHIP ROLES TESTS
   Tests event membership role helpers

   Handles:
   - membership role map creation
   - invalid membership item fallback
   - organizer role resolution
   - membership role resolution
   - missing event fallback
   - unauthenticated user fallback
================================================== */

describe("eventMembershipRoles", () => {

    /* =============================
       TEST DATA
    ============================= */

    const user = {
        userId: 1
    };

    const events = [
        {
            id: 10,
            creatorId: 1
        },
        {
            id: 20,
            creatorId: 2
        },
        {
            id: 30,
            creatorId: 3
        }
    ];

    /* =============================
       MEMBERSHIP MAP
    ============================= */

    it("builds membership role map from membership events", () => {
        const membershipMap = buildMembershipMap([
            {
                id: 20,
                role: EVENT_ROLES.PARTICIPANT
            },
            {
                id: 30,
                role: EVENT_ROLES.CO_ORGANIZER
            }
        ]);

        expect(membershipMap).toEqual({
            20: EVENT_ROLES.PARTICIPANT,
            30: EVENT_ROLES.CO_ORGANIZER
        });
    });

    it("ignores invalid membership events", () => {
        const membershipMap = buildMembershipMap([
            null,
            undefined,
            {
                role: EVENT_ROLES.PARTICIPANT
            },
            {
                id: 20,
                role: EVENT_ROLES.PARTICIPANT
            }
        ]);

        expect(membershipMap).toEqual({
            20: EVENT_ROLES.PARTICIPANT
        });
    });

    it("returns empty membership map when list is empty", () => {
        expect(buildMembershipMap()).toEqual({});
        expect(buildMembershipMap([])).toEqual({});
    });

    /* =============================
       ROLE RESOLUTION
    ============================= */

    it("returns organizer role when current user created the event", () => {
        expect(
            getCurrentUserEventRole({
                eventId: 10,
                events,
                membershipMap: {},
                user
            })
        ).toBe(EVENT_ROLES.ORGANIZER);
    });

    it("returns membership role from membership map", () => {
        expect(
            getCurrentUserEventRole({
                eventId: 20,
                events,
                membershipMap: {
                    20: EVENT_ROLES.PARTICIPANT
                },
                user
            })
        ).toBe(EVENT_ROLES.PARTICIPANT);
    });

    it("returns null when current user has no role for the event", () => {
        expect(
            getCurrentUserEventRole({
                eventId: 30,
                events,
                membershipMap: {},
                user
            })
        ).toBeNull();
    });

    it("returns null when event does not exist", () => {
        expect(
            getCurrentUserEventRole({
                eventId: 999,
                events,
                membershipMap: {},
                user
            })
        ).toBeNull();
    });

    it("returns null when user is not authenticated", () => {
        expect(
            getCurrentUserEventRole({
                eventId: 10,
                events,
                membershipMap: {},
                user: null
            })
        ).toBeNull();
    });
});
