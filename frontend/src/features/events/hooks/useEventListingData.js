import { useCallback, useState } from "react";

import { getAllEvents } from "../../../api/events/eventApi";

import useEventMembershipRoles from "../../eventMemberships/hooks/useEventMembershipRoles";

import { getNormalizedEvents } from "../eventNormalizer";
import { getEventFilterFields } from "../eventFilters";
import { getEventViewContent } from "../eventViewConfig";

/* ==================================================
   USE EVENT LISTING DATA
   Handles event listing data loading and pagination

   Handles:
   - public event loading with query params
   - event listing pagination
   - current user role resolution for event cards
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

    const loadData = useCallback(async (
        customFilters = {},
        customPage = 1,
        customView = "all"
    ) => {

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

            setEvents(getNormalizedEvents(response));

            /* =============================
               PAGINATION UPDATE
            ============================= */

            setPagination((prev = {}) => ({
                ...prev,
                page: response.page || 1,
                pageSize:
                    response.pageSize ||
                    prev.pageSize ||
                    pageSize,

                totalPages: response.totalPages || 1,
                totalEvents: response.totalEvents || 0
            }));

            /* =============================
               MEMBERSHIP FETCHING
            ============================= */

            await loadMembershipRoles();

        } catch (error) {
            console.error("Error loading events:", error);

            setError("❌ Failed to load events");

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
        getCurrentUserRoleByEvent
    };
}
