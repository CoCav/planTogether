import { useCallback, useState } from "react";

import { getAllEvents } from "../../../api/events/eventApi";

import { getApiErrorMessage } from "../../../api/apiError";

import useEventMembershipRoles from "../../eventMemberships/hooks/useEventMembershipRoles";

import { getNormalizedEvents } from "../eventNormalizer";

/* ==================================================
   USE HOME EVENTS
   Handles latest homepage event preview data

   Handles:
   - latest event loading
   - current user membership role loading
   - loading and error state
   - event card role lookup
   - authenticated membership role refresh

   Notes:
   - used by HomePage event preview section
   - optimized for lightweight latest event display
================================================== */

/* =============================
   HOME EVENT LIMIT
============================= */

// Limits homepage preview to latest events
const MAX_HOME_EVENTS = 4;

export default function useHomeEvents({ user, setError }) {

    /* =============================
       STATE
    ============================= */

    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    /* =============================
       MEMBERSHIP ROLES
    ============================= */

    const {
        loadMembershipRoles,
        getCurrentUserRoleByEvent
    } = useEventMembershipRoles({
        user,
        events
    });

    /* =============================
       EVENT LOADING
    ============================= */

    const loadData = useCallback(async () => {
        try {
            setError("");
            setIsLoading(true);

            const response = await getAllEvents({
                page: 1,
                pageSize: MAX_HOME_EVENTS,
                sortBy: "createdAt",
                order: "desc"
            });

            setEvents(getNormalizedEvents(response));

            if (user) {
                await loadMembershipRoles({ force: true });
            }

        } catch (error) {
            console.error("Error loading home events:", error);

            setError(getApiErrorMessage(error, "Failed to load events"));

        } finally {
            setIsLoading(false);
        }
    }, [
        user,
        loadMembershipRoles,
        setError
    ]);

    return {
        events,
        isLoading,
        loadData,
        getCurrentUserRoleByEvent
    };
}
