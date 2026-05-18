import { useCallback, useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { useAuth } from "../features/auth/hooks/useAuth";

import { getEventEmptyStates } from "../features/events/eventEmptyStates";
import { getInitialEventFiltersFromUrl } from "../features/events/eventQueryParams";
import { PUBLIC_EVENT_VIEWS, getEventViewContent } from "../features/events/eventViewConfig";

import useEventFilters from "../features/events/hooks/useEventFilters";
import useEventListingData from "../features/events/hooks/useEventListingData";
import useEventListingState from "../features/events/hooks/useEventListingState";

import useMembershipActions from "../features/eventMemberships/hooks/useMembershipActions";

import usePagination from "../hooks/usePagination";

import EventsFilterCard from "../components/events/EventsFilterCard";
import EventsViewTabs from "../components/events/EventsViewTabs";
import EventCard from "../components/events/EventCard";

import Alert from "../components/ui/Alert";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import Pagination from "../components/ui/Pagination";

/* ==================================================
   EVENTS PAGE
   Displays and manages public event listings

   Handles:
   - public event listing
   - filtering and sorting
   - pagination
   - URL synchronization
   - view switching
   - membership actions
================================================== */

export default function EventsPage() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();


    /* =========================
        URL state
    ========================= */
    const initialFilters = useMemo(() => getInitialEventFiltersFromUrl(searchParams), [searchParams]);


    /* =========================
        Page controllers
    ========================= */
    const { feedback, view, loadingState, paginationState, syncUrl, resetPage } = useEventListingState({
        searchParams,
        setSearchParams
    });

    // Feedback messages + error handling
    const { message, setMessage, error, setError } = feedback;

    // Active listing view + view helpers
    const { activeView, setActiveView, initialView, getFiltersForView } = view;

    // Initial loading + refresh loading states
    const { initialLoading, setInitialLoading, isLoading, setIsLoading } = loadingState;

    // Current pagination state + pagination setters
    const { pagination, setPagination, initialPage } = paginationState;


    /* =========================
        Event data
    ========================= */
    const { events, loadData, getRoleByEventId } = useEventListingData({
        user,
        pageSize: pagination.pageSize,
        setError,
        setLoading: setIsLoading,
        setInitialLoading,
        setPagination
    });


    /* =========================
        Data loading + URL sync
    ========================= */
    const loadDataAndSyncUrl = useCallback(async (nextFilters, nextPage = 1, nextView = activeView) => {
        syncUrl(nextFilters, nextPage, nextView);

        await loadData(nextFilters, nextPage, nextView);

    }, [activeView, loadData, syncUrl]);


    /* =========================
        Event filters
    ========================= */
    const { filterState, filterActions, filterHelpers } = useEventFilters({
        activeView,
        loadData: loadDataAndSyncUrl,
        initialFilters,
        resetPage
    });


    /* =========================
        Filter state
    ========================= */
    // Current filter values + filter panel visibility
    const { filters, setFilters, showFilters, setShowFilters } = filterState;


    /* =========================
        Filter actions
    ========================= */
    // Filter handlers + quick filter actions
    const {
        handleFilterChange,
        handleFilterSubmit,
        handleSortChange,
        handleResetFilters,
        handleTodayFilter,
        handleWeekendFilter
    } = filterActions;


    /* =========================
        Filter helpers
    ========================= */
    // UI helpers and derived filter labels
    const { sortLabels, isCurrentWeekendFilterActive } = filterHelpers;


    /* =========================
        Membership actions
    ========================= */
    // Join / leave event actions for authenticated users
    const { handleJoinEvent, handleLeaveEvent } = useMembershipActions({
        loadData: () => loadDataAndSyncUrl(filters, pagination.page, activeView),
        setMessage,
        setError,
        getRoleByEventId
    });


    /* =========================
        Pagination controls
    ========================= */
    const { goToPreviousPage, goToNextPage } = usePagination({
        page: pagination.page,
        totalPages: pagination.totalPages,
        onPageChange: (nextPage) => loadDataAndSyncUrl(filters, nextPage, activeView)
    });


    /* =========================
        View switching
    ========================= */
    // Updates active view and resets incompatible filters
    const handleViewChange = async (nextView) => {
        const nextFilters = getFiltersForView(filters, nextView);

        setActiveView(nextView);
        setFilters(nextFilters);
        resetPage();

        await loadDataAndSyncUrl(nextFilters, 1, nextView);
    };


    /* =========================
        Initial loading
    ========================= */
    // Prevents duplicate initial fetch in StrictMode
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        if (hasLoadedRef.current) return;

        hasLoadedRef.current = true;

        loadData(initialFilters, initialPage, initialView);
    }, [loadData, initialFilters, initialPage, initialView]);


    /* =========================
        Feedback cleanup
    ========================= */
    // Auto-clears feedback messages after delay
    useEffect(() => {
        if (!message && !error) return;

        const timer = setTimeout(() => {
            setMessage("");
            setError("");
        }, 3000);

        return () => clearTimeout(timer);
    }, [message, error, setMessage, setError]);


    /* =========================
        Derived display state
    ========================= */
    const emptyState = getEventEmptyStates({ filters, activeView });

    const viewContent = getEventViewContent(activeView);

    const showPaginationInfo = pagination.totalPages > 1;


    /* =========================
        Initial loading state
    ========================= */
    if (initialLoading) {
        return (
            <main className="container page-section">
                <LoadingState>Loading events...</LoadingState>
            </main>
        );
    }


    /* =========================
        Main render
    ========================= */

    return (
        <main className="container page-section">
            <header className="page-header">
                <div className="page-header-content">
                    <h1 className="page-title">Events</h1>

                    <p className="page-subtitle">
                        Discover events, join communities, and manage your participation.
                    </p>
                </div>

                <Link to="/events/create" className="btn btn-primary">Create Event</Link>
            </header>

            {!user && (
                <Alert type="info">
                    🔐 Login to join events and manage your participation.
                </Alert>
            )}

            {message && (<Alert type="success">{message} </Alert>)}
            {error && (<Alert type="danger">{error}</Alert>)}

            <section className="events-filters-section" aria-labelledby="events-filters-title" >
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

            <section className="events-controls-section" aria-labelledby="events-results-title" >
                <div className="events-header">
                    <div className="events-header-top">
                        <div>
                            <h2 id="events-results-title" className="section-title">
                                {viewContent.title}
                                <span className="results-count">({pagination.totalEvents})</span>
                            </h2>

                            <p className="section-subtitle">{viewContent.subtitle}</p>
                        </div>

                        {showPaginationInfo && (
                            <p className="results-page-info">Page {pagination.page} of {pagination.totalPages}</p>
                        )}
                    </div>

                    <div className="events-view-bar">
                        <EventsViewTabs
                            views={PUBLIC_EVENT_VIEWS}
                            activeView={activeView}
                            onChange={handleViewChange}
                        />

                        {viewContent.showQuickActions && (
                            <div className="events-quick-actions" aria-label="Quick event filters" >
                                <Button
                                    type="button"
                                    variant={filters.date ? "filter-active" : "outline-primary"}
                                    onClick={handleTodayFilter}
                                >
                                    Today
                                </Button>

                                <Button
                                    type="button"
                                    variant={isCurrentWeekendFilterActive(filters) ? "filter-active" : "outline-primary"}
                                    onClick={handleWeekendFilter}
                                >
                                    This Weekend
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="events-section" aria-labelledby="events-results-title">
                {isLoading ? (
                    <LoadingState>Refreshing events...</LoadingState>
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
                                role={getRoleByEventId(event.id)}
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
