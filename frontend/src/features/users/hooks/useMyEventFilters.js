import { useState } from "react";

import {
    EVENT_SORT_MAP,
    getSortLabels,
    getTodayEventFilters,
    getWeekendEventFilters,
    isCurrentWeekendFilterActive
} from "../../shared/eventListingHelpers";

import { getDefaultMyEventFilters } from "../authenticated/MyEventFilters";

/* ==================================================
   MY EVENT FILTERS HOOK
   Manages current user event filter state and handlers

   Handles:
   - filter form state
   - filter panel visibility
   - sorting
   - quick filters
   - pagination reset on filter changes

   Notes:
   - aligned with GET /users/me/events
   - public event filters belong to features/events
================================================== */

export default function useMyEventFilters({
    activeView,
    loadData,
    resetPage,
    initialFilters = getDefaultMyEventFilters()
}) {
    const [filters, setFilters] = useState(initialFilters);
    const [showFilters, setShowFilters] = useState(false);

    const sortLabels = getSortLabels(activeView);

    /* =============================
       FILTER CHANGES
    ============================= */

    // Updates filter form values
    const handleFilterChange = (event) => {
        const { name, value } = event.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Applies filters and reloads first page
    const handleFilterSubmit = async (event) => {
        event.preventDefault();

        const nextFilters = {
            ...filters,
            sortBy: filters.sortBy || "startDateTime",
            order: filters.order || "asc"
        };

        setFilters(nextFilters);
        resetPage?.();

        await loadData(nextFilters, 1, activeView);
    };

    // Resets filters and reloads first page
    const handleResetFilters = async () => {
        const resetFilters = getDefaultMyEventFilters();

        setFilters(resetFilters);
        resetPage?.();

        await loadData(resetFilters, 1, activeView);
    };

    /* =============================
       SORTING
    ============================= */

    // Maps UI sort value to backend params
    const handleSortChange = (event) => {
        const selected = EVENT_SORT_MAP[event.target.value];

        setFilters((prev) => ({
            ...prev,
            sortBy: selected?.sortBy || "startDateTime",
            order: selected?.order || "asc"
        }));
    };

    /* =============================
       QUICK FILTERS
    ============================= */

    // Toggles today's date filter
    const handleTodayFilter = async () => {
        const nextFilters = filters.date
            ? { ...filters, date: "" }
            : getTodayEventFilters(filters);

        setFilters(nextFilters);
        resetPage?.();

        await loadData(nextFilters, 1, activeView);
    };

    // Toggles current weekend date range filter
    const handleWeekendFilter = async () => {
        const isAlreadyActive = isCurrentWeekendFilterActive(filters);

        const nextFilters = isAlreadyActive
            ? { ...filters, startDate: "", endDate: "" }
            : getWeekendEventFilters(filters);

        setFilters(nextFilters);
        resetPage?.();

        await loadData(nextFilters, 1, activeView);
    };

    return {
        filters,
        setFilters,
        showFilters,
        setShowFilters,
        sortLabels,
        isCurrentWeekendFilterActive,
        handleFilterChange,
        handleFilterSubmit,
        handleSortChange,
        handleResetFilters,
        handleTodayFilter,
        handleWeekendFilter
    };
}
