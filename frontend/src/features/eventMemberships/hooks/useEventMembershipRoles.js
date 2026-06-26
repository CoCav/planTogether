import { useCallback, useRef, useState } from "react";

import { getCurrentUserEvents } from "../../../api/users/userApi";

import { fetchAllPaginated } from "../../../utils/pagination";

import { getMyEventsWithRole } from "../../users/authenticated/myEventNormalizer";

import {
    buildMembershipMap,
    getCurrentUserEventRole
} from "../eventMembershipRoles";

/* ==================================================
   USE EVENT MEMBERSHIP ROLES
   Handles current user membership role loading

   Handles:
   - current user membership loading
   - membership role map creation
   - current user role lookup for event cards
   - unauthenticated user fallback
   - duplicate membership role fetch prevention
   - created and joined event role loading

   Notes:
   - intended for lightweight event listing previews
   - used when event cards need current user role context
================================================== */

export default function useEventMembershipRoles({
    user,
    events = []
}) {

    /* =============================
       STATE
    ============================= */

    const [membershipMap, setMembershipMap] = useState({});

    // Tracks the last user whose roles were loaded
    const loadedUserIdRef = useRef(null);

    /* =============================
       MEMBERSHIP LOADING
    ============================= */

    const loadMembershipRoles = useCallback(async ({ force = false } = {}) => {

        if (!user) {
            setMembershipMap({});
            loadedUserIdRef.current = null;
            return;
        }

        if (!force && loadedUserIdRef.current === user.userId) {
            return;
        }

        // Load created events
        const createdEvents = await fetchAllPaginated({
            fetchPage: (params) =>
                getCurrentUserEvents({
                    ...params,
                    view: "created"
                }),
            getItems: getMyEventsWithRole,
            pageSize: 10
        });

        // Load joined events
        const joinedEvents = await fetchAllPaginated({
            fetchPage: (params) =>
                getCurrentUserEvents({
                    ...params,
                    view: "joined"
                }),
            getItems: getMyEventsWithRole,
            pageSize: 10
        });

        // Merge created and joined roles into a single eventId -> role map
        setMembershipMap(
            buildMembershipMap([
                ...createdEvents,
                ...joinedEvents
            ])
        );

        loadedUserIdRef.current = user.userId;

    }, [user]);

    /* =============================
       ROLE HELPERS
    ============================= */

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
