import { useCallback, useState } from "react";

import { getAllEvents } from "../../../api/events/eventApi";

import { getApiErrorMessage } from "../../../api/apiError";

import useEventMembershipRoles from "../../eventMemberships/hooks/useEventMembershipRoles";

import { EVENT_STATUS } from "../../shared/constants/eventStatus";

import { normalizePaginatedEvents } from "../eventNormalizer";
import { getEventFilterFields } from "../eventFilters";
import { getEventViewContent } from "../eventViewConfig";

/* ==================================================
   USE EVENT LISTING DATA
   Handles event listing data loading and pagination

   Handles:
   - public event loading with query params
   - paginated event payload normalization
   - event listing pagination
   - current user role resolution for event cards
   - forced membership role refresh after event loading
   - local event like state update after like/unlike mutation
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
       HELPERS
    ============================= */

    const removeEmptyParams = (params = {}) => {
        return Object.fromEntries(
            Object.entries(params).filter(([, value]) => {
                return String(value ?? "").trim() !== "";
            })
        );
    };

    /* =============================
       LIKE STATE UPDATE
    ============================= */

    // Updates one event like state after like/unlike mutation
    const handleEventLikeChange = useCallback((likeState) => {
        setEvents((previousEvents) =>
            previousEvents.map((event) =>
                event.id === likeState.eventId
                    ? {
                        ...event,
                        likesCount: likeState.likesCount,
                        isLikedByCurrentUser: likeState.liked
                    }
                    : event
            )
        );
    }, []);

    /* =============================
       STATE
    ============================= */

    const [events, setEvents] = useState([]);

    /* =============================
       MEMBERSHIP ROLES
    ============================= */

    const { loadMembershipRoles, getCurrentUserRoleByEvent } = useEventMembershipRoles({
        user,
        events
    });

    /* =============================
       EVENT LOADING
    ============================= */

    const loadData = useCallback(async (customFilters = {}, customPage = 1, customView = EVENT_STATUS.ONGOING) => {

        try {
            setError("");
            setLoading(true);

            /* =============================
               VIEW CONFIGURATION
            ============================= */

            const viewContent = getEventViewContent(customView);

            /* =============================
               SORT RESOLUTION
            ============================= */

            const { sortBy, order } = customFilters;

            const filters = getEventFilterFields(customFilters);

            const resolvedSortBy = sortBy || viewContent.defaultSortBy;

            const resolvedOrder = order || viewContent.defaultOrder;

            /* =============================
               API PARAMS
            ============================= */

            const params = {
                ...filters,
                ...(viewContent.status && {
                    status: viewContent.status
                }),
                sortBy: resolvedSortBy,
                order: resolvedOrder,
                page: customPage,
                pageSize
            };

            /* =============================
               EVENT FETCHING
            ============================= */

            const response = await getAllEvents(removeEmptyParams(params));

            const payload = normalizePaginatedEvents(response);

            setEvents(payload.events);

            /* =============================
               PAGINATION UPDATE
            ============================= */

            setPagination((prev = {}) => ({
                ...prev,
                page: payload.page,
                pageSize: payload.pageSize || prev.pageSize || pageSize,
                totalPages: payload.totalPages,
                totalEvents: payload.totalEvents
            }));

            /* =============================
               MEMBERSHIP FETCHING
            ============================= */

            // Refreshes roles after events are loaded
            await loadMembershipRoles({ force: true });

        } catch (error) {
            console.error("Error loading events:", error);

            setError(getApiErrorMessage(error, "Failed to load events"));

        } finally {
            setLoading(false);
            setInitialLoading(false);
        }

    }, [
        pageSize,
        loadMembershipRoles,
        setError,
        setLoading,
        setInitialLoading,
        setPagination
    ]);

    return {
        events,
        loadData,
        getCurrentUserRoleByEvent,
        handleEventLikeChange
    };
}
