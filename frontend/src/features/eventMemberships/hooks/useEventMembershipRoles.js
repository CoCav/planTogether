import { useCallback, useState } from "react";

import { getCurrentUserEvents } from "../../../api/users/userApi";

import { fetchAllPaginated } from "../../../utils/pagination";

import { getMyEventsWithRole } from "../../users/authenticated/myEventNormalizer";

import { buildMembershipMap, getCurrentUserEventRole } from "../eventMembershipRoles";

/* ==================================================
   USE EVENT MEMBERSHIP ROLES
   Handles current user membership role loading

   Handles:
   - current user membership loading
   - membership role map creation
   - current user role lookup for event cards
   - unauthenticated user fallback

   Notes:
   - intended for lightweight event listing previews
   - used when event cards need current user role context
================================================== */

export default function useEventMembershipRoles({
    user,
    events = []
}) {
    const [membershipMap, setMembershipMap] = useState({});

    const loadMembershipRoles = useCallback(async () => {
        if (!user) {
            setMembershipMap({});
            return;
        }

        const membershipEvents = await fetchAllPaginated({
            fetchPage: getCurrentUserEvents,
            getItems: getMyEventsWithRole,
            pageSize: 10
        });

        setMembershipMap(buildMembershipMap(membershipEvents));
    }, [user]);

    // Resolves current user's membership role for an event card
    const getCurrentUserRoleByEvent = useCallback((eventId) => {
        return getCurrentUserEventRole({
            eventId,
            events,
            membershipMap,
            user
        });
    }, [
        events,
        membershipMap,
        user
    ]);

    return {
        membershipMap,
        setMembershipMap,
        loadMembershipRoles,
        getCurrentUserRoleByEvent
    };
}
