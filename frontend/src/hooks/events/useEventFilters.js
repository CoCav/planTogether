import { useState } from "react";
import { getDefaultEventFilters, EVENT_SORT_MAP, getSortLabels, getTodayEventFilters, getWeekendEventFilters, isCurrentWeekendFilterActive } from "../../features/events/eventFilters";

/* ==================================================
   EVENT FILTERS HOOK
   Manages shared event filter state and handlers

   Handles:
   - filter form state
   - filter panel visibility
   - sorting
   - quick filters
   - pagination reset on filter changes
================================================== */

export default function useEventFilters({ activeView, loadData, resetPage }) {
    const [filters, setFilters] = useState(getDefaultEventFilters);
    const [showFilters, setShowFilters] = useState(false);

    const sortLabels = getSortLabels(activeView);

    /* =========================
       Filter input changes
       Updates filter form values
    ========================= */

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    /* =========================
       Filter submit
       Applies filters and reloads first page
    ========================= */

    const handleFilterSubmit = async (e) => {
        e.preventDefault();

        const nextFilters = {
            ...filters,
            sortBy: filters.sortBy || "startDateTime",
            order: filters.order || "asc"
        };

        setFilters(nextFilters);
        resetPage?.();

        await loadData(nextFilters, 1);
    };

    /* =========================
       Sort changes
       Maps UI sort value to backend params
    ========================= */

    const handleSortChange = (e) => {
        const selected = EVENT_SORT_MAP[e.target.value];

        setFilters((prev) => ({
            ...prev,
            sortBy: selected?.sortBy || "startDateTime",
            order: selected?.order || "asc"
        }));
    };

    /* =========================
       Reset filters
       Restores default filters and reloads first page
    ========================= */

    const handleResetFilters = async () => {
        const resetFilters = getDefaultEventFilters();

        setFilters(resetFilters);
        resetPage?.();

        await loadData(resetFilters, 1);
    };

    /* =========================
       Today quick filter
       Toggles today's date filter
    ========================= */

    const handleTodayFilter = async () => {
        const isAlreadyActive = Boolean(filters.date);

        const nextFilters = isAlreadyActive ? { ...filters, date: "" } : getTodayEventFilters(filters);

        setFilters(nextFilters);
        resetPage?.();

        await loadData(nextFilters, 1);
    };

    /* =========================
       Weekend quick filter
       Toggles current weekend date range
    ========================= */

    const handleWeekendFilter = async () => {
        const isAlreadyActive = isCurrentWeekendFilterActive(filters);

        const nextFilters = isAlreadyActive ? { ...filters, startDate: "", endDate: "" } : getWeekendEventFilters(filters);

        setFilters(nextFilters);
        resetPage?.();

        await loadData(nextFilters, 1);
    };

    return { filters, setFilters, showFilters, setShowFilters, sortLabels, isCurrentWeekendFilterActive, handleFilterChange, handleFilterSubmit, handleSortChange, handleResetFilters, handleTodayFilter, handleWeekendFilter };
}
