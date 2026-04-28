/* ==================================================
   EVENT FILTERS HOOK
   --------------------------------------------------
   Centralizes React state and handlers for event filters.

   This hook handles:
   - filter form state
   - filter panel visibility
   - sort changes
   - reset filters
   - quick filters such as Today and This Weekend

   Goal:
   Keep event pages clean by extracting shared filter
   state and interaction logic.
================================================== */

import { useState } from "react";
import { getDefaultEventFilters, EVENT_SORT_MAP, getSortLabels, getTodayEventFilters, getWeekendEventFilters, isCurrentWeekendFilterActive } from "../../features/events/eventFilters";

export default function useEventFilters({ activeView, loadData, resetPage }) {
    // Filters state: controls all event filtering inputs
    const [filters, setFilters] = useState(getDefaultEventFilters);

    // Filters visibility state: controls whether filter form is expanded or collapsed
    const [showFilters, setShowFilters] = useState(false);

    // Dynamic sort labels: adapts sorting labels depending on the active view
    const sortLabels = getSortLabels(activeView);

    /* =========================
       Filter input handler
       Updates filter state on user input
    ========================= */

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /* =========================
       Filter submit handler
       Applies current filters and resets pagination
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
       Sort handler
       Maps selected UI option to backend sort params
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
       Reset handler
       Clears filters and reloads first page
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