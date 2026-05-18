import { useCallback, useState } from "react";

import { getAllEvents, getFilteredEvents } from "../../../api/events/eventApi";

import { getCurrentUserEvents } from "../../../api/users/userApi";

import { fetchAllPaginated } from "../../../utils/pagination";

import { EVENT_ROLES } from "../../shared/eventRoles";

import { getMyEventsWithRole } from "../../users/authenticated/myEventNormalizer";

import { getNormalizedEvents } from "../eventNormalizer";
import { getEventFilterFields } from "../eventFilters";
import { getEventViewContent } from "../eventViewConfig";

/* ==================================================
   USE EVENT LISTING DATA
   Handles event listing data loading and role mapping

   Handles:
   - public event loading
   - filtered event loading
   - current user membership role mapping
   - event role resolution
================================================== */

export default function useEventListingData({
    user,
    pageSize,
    setError,
    setLoading,
    setInitialLoading,
    setPagination
}) {

    /* =============================
       STATE
    ============================= */

    const [events, setEvents] = useState([]);
    const [myEvents, setMyEvents] = useState({});

    /* =============================
       MEMBERSHIP MAP
    ============================= */

    // Converts membership event list into eventId -> role map
    const buildMembershipMap = (membershipEvents = []) => {
        const membershipMap = {};

        membershipEvents.forEach((item) => {
            if (!item?.id) return;

            membershipMap[item.id] = item.role;
        });

        return membershipMap;
    };

    /* =============================
       EVENT LOADING
    ============================= */

    const loadData = useCallback(async (customFilters = {}, customPage = 1, customView = "all") => {

        try {
            setError("");
            setLoading(true);

            /* =============================
               VIEW CONFIGURATION
            ============================= */

            const view = getEventViewContent(customView);

            const { sortBy, order } = customFilters;

            const filters = getEventFilterFields(customFilters);

            /* =============================
               SORT RESOLUTION
            ============================= */

            const resolvedSortBy = sortBy || view.defaultSortBy;
            const resolvedOrder = order || view.defaultOrder;

            /* =============================
               FILTER DETECTION
            ============================= */

            const hasFilters = Object.values(filters).some(
                (value) => String(value).trim() !== ""
            );

            /* =============================
               API PARAMS
            ============================= */

            const params = {
                ...filters,
                ...(view.status && {
                    status: view.status
                }),
                sortBy: resolvedSortBy,
                order: resolvedOrder,
                page: customPage,
                pageSize
            };

            /* =============================
               EVENT FETCHING
            ============================= */

            const response = hasFilters
                ? await getFilteredEvents(params)
                : await getAllEvents(params);

            setEvents(getNormalizedEvents(response));

            /* =============================
               PAGINATION UPDATE
            ============================= */

            setPagination((prev) => ({
                ...prev,
                page: response.data.page || 1,
                pageSize: response.data.pageSize || prev.pageSize,
                totalPages: response.data.totalPages || 1,
                totalEvents: response.data.totalEvents || 0
            }));

            /* =============================
               MEMBERSHIP FETCHING
            ============================= */

            if (!user) {
                setMyEvents({});
                return;
            }

            const membershipEvents =
                await fetchAllPaginated({
                    fetchPage: getCurrentUserEvents,
                    normalizePage: getMyEventsWithRole,
                    pageSize: 10
                });

            setMyEvents(
                buildMembershipMap(membershipEvents)
            );

        } catch (error) {
            console.error(
                "Error loading events:",
                error
            );

            setError("❌ Failed to load events");

        } finally {
            setLoading(false);
            setInitialLoading(false);
        }

    }, [
        pageSize,
        user,
        setError,
        setLoading,
        setInitialLoading,
        setPagination
    ]);

    /* =============================
       ROLE RESOLUTION
    ============================= */

    // Resolves current user's role for a given event
    const getRoleByEventId = useCallback((eventId) => {
        const event = events.find(
            (item) => item.id === eventId
        );

        if (!user || !event) {
            return null;
        }

        if (event.creatorId === user.userId) {
            return EVENT_ROLES.ORGANIZER;
        }

        return myEvents[eventId] || null;

    }, [
        events,
        myEvents,
        user
    ]);

    return {
        events,
        loadData,
        getRoleByEventId
    };
}
