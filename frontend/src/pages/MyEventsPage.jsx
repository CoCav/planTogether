
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "../features/auth/hooks/useAuth";

import { getUserEventEmptyState } from "../features/users/userEmptyStates";
import { getInitialMyEventFiltersFromUrl } from "../features/users/authenticated/myEventQueryParams";
import { getMyEventViewContent, MY_EVENT_VIEWS } from "../features/users/authenticated/myEventViewConfig";
import useMyEventFilters from "../features/users/authenticated/hooks/useMyEventFilters";
import useMyEventListingData from "../features/users/authenticated/hooks/useMyEventListingData";
import useMyEventListingState from "../features/users/authenticated/hooks/useMyEventListingState";

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
   MY EVENTS PAGE
   Displays and manages the current user's event listings

   Handles:
   - created and joined event views
   - current user event history
   - filters and quick filters
   - pagination
   - URL synchronization
   - leave event action
   - accessible filter and results sections
   - accessible listing metadata
================================================== */

export default function MyEventsPage() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();


    /* =============================
       URL STATE
    ============================= */

    const initialFilters = useMemo(
        () => getInitialMyEventFiltersFromUrl(searchParams),
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
    } = useMyEventListingState({
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

    const { events, loadData, getRoleByEventId } = useMyEventListingData({
        pageSize: pagination.pageSize,
        setError,
        setLoading: setIsLoading,
        setInitialLoading,
        setPagination
    });


    /* =============================
       DATA LOADING / URL SYNC
    ============================= */

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

    const { filterState, filterActions, filterHelpers } = useMyEventFilters({
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

    const { handleLeaveEvent } = useMembershipActions({
        loadData: () => loadDataAndSyncUrl(
            filters,
            pagination.page,
            activeView
        ),
        setMessage,
        setError,
        getRoleByEventId
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

    const handleViewChange = async (nextView) => {
        const nextViewContent = getMyEventViewContent(nextView);

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

    const emptyState = getUserEventEmptyState({
        filters,
        activeView
    });

    const viewContent = getMyEventViewContent(activeView);

    const showPaginationInfo = pagination.totalPages > 1;


    /* =============================
       INITIAL LOADING STATE
    ============================= */

    if (initialLoading) {
        return (
            <PageLoader>
                Loading your events...
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
                    <h1 className="page-title">My Events</h1>

                    <p className="page-subtitle">View the events you created and joined.</p>
                </div>
            </header>

            {message && <Alert type="success">{message}</Alert>}
            {error && <Alert type="danger">{error}</Alert>}

            <section className="events-filters-section" aria-label="My event filters">
                <EventsFilterCard
                    filters={filters}
                    showFilters={showFilters}

                    sortLabels={sortLabels}

                    resultsCount={pagination.totalEvents}

                    onToggleFilters={() => setShowFilters((prev) => !prev)}

                    onFilterChange={handleFilterChange}
                    onFilterSubmit={handleFilterSubmit}

                    onSortChange={handleSortChange}
                    onResetFilters={handleResetFilters}
                />
            </section>

            <section className="events-results-controls">
                <EventsToolbar
                    titleId="my-events-results-title"
                    title={viewContent.title}
                    subtitle={viewContent.subtitle}

                    totalEvents={pagination.totalEvents}
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    showPaginationInfo={showPaginationInfo}

                    views={MY_EVENT_VIEWS}
                    activeView={activeView}
                    onViewChange={handleViewChange}

                    showQuickActions={viewContent.showQuickActions}
                    filters={filters}

                    isCurrentWeekendFilterActive={isCurrentWeekendFilterActive}
                    onTodayFilter={handleTodayFilter}
                    onWeekendFilter={handleWeekendFilter}
                />
            </section>

            <section className="events-results-section" aria-labelledby="my-events-results-title">
                {isLoading ? (
                    <LoadingState>
                        Refreshing your events...
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
                                role={event.role}
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
                label="My events pagination"
            />
        </main>
    );
}
