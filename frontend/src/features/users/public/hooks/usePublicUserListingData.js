import { useCallback, useState } from "react";

import { getPublicUserProfile, getPublicUserEvents } from "../../../../api/users/userApi";

import { getNormalizedPublicUserProfile } from "../publicUserNormalizer";
import { getNormalizedPublicUserEvents } from "../publicUserEventNormalizer";

/* ==================================================
   USE PUBLIC USER LISTING DATA
   Handles public user profile and event listing data loading

   Handles:
   - initial public user profile loading
   - public event listing loading
   - total public event count derivation
   - view-based event listing requests
   - empty filter cleanup before API requests
   - public user payload normalization
   - paginated event payload normalization
   - pagination state updates
================================================== */

/* =============================
   HELPERS
============================= */

// Removes empty filter values before API requests
const removeEmptyFilters = (filters = {}) => {
    return Object.fromEntries(
        Object.entries(filters).filter(([, value]) => {
            return String(value ?? "").trim() !== "";
        })
    );
};

export default function usePublicUserListingData({
    userId,
    filters,
    activeView,
    viewContent,
    pagination,
    setPagination,
    setInitialLoading,
    setIsLoading,
    setError
}) {

    /* =============================
       STATE
    ============================= */

    const [profile, setProfile] = useState({
        user: {
            name: "",
            avatar: null
        },
        stats: {
            createdEventsCount: 0,
            joinedEventsCount: 0
        }
    });

    const [events, setEvents] = useState([]);

    /* =============================
       DERIVED DATA
    ============================= */

    const totalPublicEvents =
        profile.stats.createdEventsCount + profile.stats.joinedEventsCount;

    /* =============================
       PROFILE LOADING
    ============================= */

    // Loads public user profile and statistics
    const loadProfile = useCallback(async () => {
        const profilePayload = await getPublicUserProfile(userId);

        setProfile(getNormalizedPublicUserProfile(profilePayload));
    }, [
        userId
    ]);

    /* =============================
       EVENT LOADING
    ============================= */

    // Loads paginated public user events for the selected view
    const loadEvents = useCallback(async ({
        filters: nextFilters = filters,
        page: nextPage = pagination.page,
        view: nextView = activeView
    } = {}) => {

        /* =============================
           API PARAMS
        ============================= */

        const params = {
            ...removeEmptyFilters(nextFilters),
            view: nextView,
            page: nextPage,
            pageSize: pagination.pageSize,
            sortBy: viewContent.defaultSortBy,
            order: viewContent.defaultOrder
        };

        /* =============================
           EVENT FETCHING
        ============================= */

        const eventsPayload = await getPublicUserEvents(userId, params);

        const normalizedEvents = getNormalizedPublicUserEvents(eventsPayload);

        setEvents(normalizedEvents.events);

        /* =============================
           PAGINATION UPDATE
        ============================= */

        setPagination((prev) => ({
            ...prev,
            page: normalizedEvents.page,
            pageSize: normalizedEvents.pageSize,
            totalEvents: normalizedEvents.totalEvents,
            totalPages: normalizedEvents.totalPages
        }));
    }, [
        userId,
        filters,
        activeView,
        viewContent,
        pagination.page,
        pagination.pageSize,
        setPagination
    ]);

    /* =============================
       INITIAL DATA LOADING
    ============================= */

    // Loads profile and first event listing together on initial page load
    const loadInitialData = useCallback(async (options = {}) => {
        try {
            setError("");
            setIsLoading(true);

            await Promise.all([
                loadProfile(),
                loadEvents(options)
            ]);

        } catch (error) {
            console.error("Error loading public user:", error);

            setError("Failed to load public user profile");

        } finally {
            setIsLoading(false);
            setInitialLoading(false);
        }
    }, [
        loadProfile,
        loadEvents,
        setError,
        setIsLoading,
        setInitialLoading
    ]);

    /* =============================
       EVENT REFRESH
    ============================= */

    // Refreshes only the event listing after view or pagination changes
    const refreshEvents = useCallback(async (options = {}) => {
        try {
            setError("");
            setIsLoading(true);

            await loadEvents(options);

        } catch (error) {
            console.error("Error loading public user events:", error);

            setError("Failed to load public user events");

        } finally {
            setIsLoading(false);
        }
    }, [
        loadEvents,
        setError,
        setIsLoading
    ]);

    return {
        profile,
        events,
        totalPublicEvents,
        loadInitialData,
        refreshEvents
    };
}
