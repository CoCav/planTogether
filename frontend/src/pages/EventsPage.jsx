import { useCallback, useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useAuth } from "../features/auth/hooks/useAuth";

import { getEventEmptyStates } from "../features/events/eventEmptyStates";
import { getInitialEventFiltersFromUrl } from "../features/events/eventQueryParams";
import { getEventViewContent, PUBLIC_EVENT_VIEWS } from "../features/events/eventViewConfig";

import useEventFilters from "../features/events/hooks/useEventFilters";
import useEventListingData from "../features/events/hooks/useEventListingData";
import useEventListingState from "../features/events/hooks/useEventListingState";

import useMembershipActions from "../features/eventMemberships/hooks/useMembershipActions";

import usePagination from "../hooks/usePagination";

import EventCard from "../components/events/EventCard";
import EventsFilterCard from "../components/events/EventsFilterCard";

import EventsToolbar from "../components/events/EventsToolbar";

import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import PageLoader from "../components/ui/PageLoader";
import Pagination from "../components/ui/Pagination";

/* ==================================================
   EVENTS PAGE
   Displays and manages public event listings

   Handles:
   - public event listing
   - filters and quick filters
   - pagination
   - URL synchronization
   - view switching
   - membership actions
   - accessible filters and results sections
   - accessible results metadata
================================================== */

export default function EventsPage() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();


    /* =============================
       URL STATE
    ============================= */

    const initialFilters = useMemo(
        () => getInitialEventFiltersFromUrl(searchParams),
        [searchParams]
    );


    /* =============================
       PAGE STATE
    ============================= */

    const {
        feedback,
        view,
        loadingState,
        paginationState,
        syncUrl,
        resetPage
    } = useEventListingState({
        searchParams,
        setSearchParams
    });

    // Feedback messages and error handling
    const { message, setMessage, error, setError } = feedback;

    // Active listing view and view helpers
    const { activeView, setActiveView, initialView, getFiltersForView } = view;

    // Initial and refresh loading states
    const { initialLoading, setInitialLoading, isLoading, setIsLoading } = loadingState;

    // Pagination data and setters
    const { pagination, setPagination, initialPage } = paginationState;


    /* =============================
       EVENT DATA
    ============================= */

    const { events, loadData, getCurrentUserRoleByEvent } = useEventListingData({
        user,
        pageSize: pagination.pageSize,
        setError,
        setLoading: setIsLoading,
        setInitialLoading,
        setPagination
    });


    /* =============================
       DATA LOADING / URL SYNC
    ============================= */

    // Syncs URL then refreshes event data
    const loadDataAndSyncUrl = useCallback(async (nextFilters, nextPage = 1, nextView = activeView) => {
        syncUrl(nextFilters, nextPage, nextView);

        await loadData(nextFilters, nextPage, nextView);
    }, [
        activeView,
        loadData,
        syncUrl
    ]);


    /* =============================
       FILTER STATE / ACTIONS
    ============================= */

    const { filterState, filterActions, filterHelpers } = useEventFilters({
        activeView,
        loadData: loadDataAndSyncUrl,
        initialFilters,
        resetPage
    });

    // Current filter values and filter panel visibility
    const { filters, setFilters, showFilters, setShowFilters } = filterState;

    // Filter handlers and quick filter actions
    const {
        handleFilterChange,
        handleFilterSubmit,
        handleSortChange,
        handleResetFilters,
        handleTodayFilter,
        handleWeekendFilter
    } = filterActions;

    // Filter UI helpers
    const { sortLabels, isCurrentWeekendFilterActive } = filterHelpers;


    /* =============================
       MEMBERSHIP ACTIONS
    ============================= */

    const { handleJoinEvent, handleLeaveEvent } = useMembershipActions({
        loadData: () => loadDataAndSyncUrl(
            filters,
            pagination.page,
            activeView
        ),
        setMessage,
        setError,
        getCurrentUserRoleByEvent
    });


    /* =============================
       PAGINATION CONTROLS
    ============================= */

    const { goToPreviousPage, goToNextPage } = usePagination({
        page: pagination.page,
        totalPages: pagination.totalPages,
        onPageChange: (nextPage) => loadDataAndSyncUrl(filters, nextPage, activeView)
    });


    /* =============================
       VIEW SWITCHING
    ============================= */

    // Updates active view and resets incompatible filters
    const handleViewChange = async (nextView) => {
        const nextViewContent = getEventViewContent(nextView);

        const nextFilters = {
            ...getFiltersForView(filters, nextView),
            sortBy: nextViewContent.defaultSortBy,
            order: nextViewContent.defaultOrder
        };

        setActiveView(nextView);
        setFilters(nextFilters);
        resetPage();

        await loadDataAndSyncUrl(nextFilters, 1, nextView);
    };

    /* =============================
       INITIAL DATA LOADING
    ============================= */

    // Prevents duplicate initial fetch in StrictMode
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        if (hasLoadedRef.current) return;

        hasLoadedRef.current = true;

        loadData(initialFilters, initialPage, initialView);
    }, [
        loadData,
        initialFilters,
        initialPage,
        initialView
    ]);


    /* =============================
       FEEDBACK CLEANUP
    ============================= */

    // Auto-clears feedback messages after delay
    useEffect(() => {
        if (!message && !error) return;

        const timer = setTimeout(() => {
            setMessage("");
            setError("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [
        message,
        error,
        setMessage,
        setError
    ]);


    /* =============================
       DISPLAY STATE
    ============================= */

    const emptyState = getEventEmptyStates({
        filters,
        activeView
    });

    const viewContent = getEventViewContent(activeView);

    const showPaginationInfo = pagination.totalPages > 1;


    /* =============================
       INITIAL LOADING STATE
    ============================= */

    if (initialLoading) {
        return (
            <PageLoader>
                Loading events...
            </PageLoader>
        );
    }


    /* =============================
       MAIN RENDER
    ============================= */

    return (
        <main className="container page-section">
            <header className="page-header">
                <div className="page-header-content">
                    <h1 id="events-page-title" className="page-title">
                        Events
                    </h1>

                    <p className="page-subtitle">
                        Discover events, join communities, and manage your participation.
                    </p>
                </div>

                <Link to="/events/create" className="btn btn-primary">Create Event</Link>
            </header>

            {!user && <Alert type="info">🔐 Login to join events and manage your participation.</Alert>}

            {message && <Alert type="success">{message}</Alert>}
            {error && <Alert type="danger">{error}</Alert>}

            <section className="events-filters-section" aria-label="Event filters">
                <EventsFilterCard
                    filters={filters}
                    showFilters={showFilters}
                    sortLabels={sortLabels}
                    onToggleFilters={() => setShowFilters((prev) => !prev)}
                    onFilterChange={handleFilterChange}
                    onFilterSubmit={handleFilterSubmit}
                    onSortChange={handleSortChange}
                    onResetFilters={handleResetFilters}
                />
            </section>

            <section className="events-results-controls" aria-labelledby="events-results-title">
                <EventsToolbar
                    titleId="events-results-title"
                    title={viewContent.title}
                    subtitle={viewContent.subtitle}

                    totalEvents={pagination.totalEvents}
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    showPaginationInfo={showPaginationInfo}

                    views={PUBLIC_EVENT_VIEWS}
                    activeView={activeView}
                    onViewChange={handleViewChange}

                    showQuickActions={viewContent.showQuickActions}
                    filters={filters}

                    isCurrentWeekendFilterActive={isCurrentWeekendFilterActive}
                    onTodayFilter={handleTodayFilter}
                    onWeekendFilter={handleWeekendFilter}
                />
            </section>

            <section className="events-results-section" aria-labelledby="events-results-title">
                {isLoading ? (
                    <LoadingState>
                        Refreshing events...
                    </LoadingState>
                ) : events.length === 0 ? (
                    <EmptyState
                        title={emptyState.title || viewContent.empty}
                        description={emptyState.description}
                    />
                ) : (
                    <div className="events-grid">
                        {events.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                user={user}
                                role={getCurrentUserRoleByEvent(event.id)}
                                onJoin={handleJoinEvent}
                                onLeave={handleLeaveEvent}
                            />
                        ))}
                    </div>
                )}
            </section>

            <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onPrevious={goToPreviousPage}
                onNext={goToNextPage}
                label="Events pagination"
            />
        </main>
    );
}
