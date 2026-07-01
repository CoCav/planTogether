import { useCallback, useState } from "react";

import { getCurrentUserEvents } from "../../../../api/users/userApi";

import { getApiErrorMessage } from "../../../../api/apiError";

import { getMyEventViewContent } from "../myEventViewConfig";
import { getMyEventFilterFields } from "../myEventFilters";
import { normalizePaginatedMyEvents } from "../myEventNormalizer";

/* ==================================================
   USE MY EVENT LISTING DATA
   Handles current user event listing data loading

   Handles:
   - current user event loading
   - view-based default sorting
   - paginated payload normalization
   - pagination state updates
   - current user role resolution
   - local event like state update after like/unlike mutation
================================================== */

export default function useMyEventListingData({
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
       DATA LOADING
    ============================= */

    const loadData = useCallback(async (customFilters = {}, customPage = 1, customView = "created") => {

        try {
            setError("");
            setLoading(true);

            /* =============================
               VIEW CONFIGURATION
            ============================= */

            const viewContent = getMyEventViewContent(customView);

            /* =============================
               SORT RESOLUTION
            ============================= */

            const { sortBy, order } = customFilters;

            const filters = getMyEventFilterFields(customFilters);

            const resolvedSortBy = sortBy || viewContent.defaultSortBy;
            const resolvedOrder = order || viewContent.defaultOrder;

            /* =============================
               API PARAMS
            ============================= */

            const params = {
                view: customView,
                ...filters,
                page: customPage,
                pageSize,
                sortBy: resolvedSortBy,
                order: resolvedOrder
            };

            /* =============================
               EVENT FETCHING
            ============================= */

            const response = await getCurrentUserEvents(removeEmptyParams(params));

            const normalizedPayload = normalizePaginatedMyEvents(response);

            setEvents(normalizedPayload.events);

            /* =============================
               PAGINATION UPDATE
            ============================= */

            setPagination((prev = {}) => ({
                ...prev,
                page: normalizedPayload.page,
                pageSize: normalizedPayload.pageSize || prev.pageSize || pageSize,
                totalPages: normalizedPayload.totalPages,
                totalEvents: normalizedPayload.totalEvents
            }));
        } catch (error) {
            console.error("Error loading my events:", error);

            setError(getApiErrorMessage(error, "Failed to load your events"));
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    }, [
        pageSize,
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
        return events.find((event) => event.id === eventId)?.role || null;
    }, [
        events
    ]);

    return {
        events,
        loadData,
        getCurrentUserRoleByEvent: getRoleByEventId,
        handleEventLikeChange
    };
}
