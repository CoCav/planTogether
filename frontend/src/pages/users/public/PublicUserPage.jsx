import { useCallback, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Bookmark, FolderOpen } from "lucide-react";

import usePublicUserListingData from "../../../features/users/public/hooks/usePublicUserListingData";
import usePublicUserListingState from "../../../features/users/public/hooks/usePublicUserListingState";

import { getPublicUserEventViewContent, PUBLIC_USER_EVENT_VIEWS } from "../../../features/users/public/publicUserEventViewConfig";

import usePagination from "../../../hooks/usePagination";

import EventCard from "../../../components/events/EventCard";
import EventsToolbar from "../../../components/events/EventsToolbar";

import UserAvatar from "../../../components/users/UserAvatar";
import { getAvatar } from "../../../utils/uploadedFiles";

import Alert from "../../../components/ui/Alert";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import LoadingState from "../../../components/ui/LoadingState";
import PageLoader from "../../../components/ui/PageLoader";
import Pagination from "../../../components/ui/Pagination";

/* ==================================================
   PUBLIC USER PAGE
   Displays a public user's profile and event listings

   Handles:
   - public profile display
   - created and joined public event views
   - URL-synchronized view and pagination
   - paginated public user event loading
   - public event listing metadata
   - loading, error and empty states
   - decorative profile metadata icons
================================================== */

export default function PublicUserPage() {
    const { userId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    /* =============================
       PAGE STATE
    ============================= */

    const {
        feedback,
        view,
        filtersState,
        loadingState,
        paginationState,
        syncUrl,
        resetPage
    } = usePublicUserListingState({
        searchParams,
        setSearchParams
    });

    // Feedback messages and error handling
    const { error, setError } = feedback;

    // Active listing view and view content
    const { activeView, setActiveView, initialView, viewContent } = view;

    // Public user event filters
    const { filters, setFilters, initialFilters } = filtersState;

    // Initial and refresh loading states
    const { initialLoading, setInitialLoading, isLoading, setIsLoading } = loadingState;

    // Pagination data and setters
    const { pagination, setPagination, initialPage } = paginationState;

    /* =============================
       PUBLIC USER DATA
    ============================= */

    const {
        profile,
        events,
        loadInitialData,
        refreshEvents
    } = usePublicUserListingData({
        userId,
        filters,
        activeView,
        viewContent,
        pagination,
        setPagination,
        setInitialLoading,
        setIsLoading,
        setError
    });

    const avatar = getAvatar(profile?.user?.avatar);

    /* =============================
       DATA LOADING / URL SYNC
    ============================= */

    const loadDataAndSyncUrl = useCallback(async (
        nextFilters,
        nextPage = 1,
        nextView = activeView
    ) => {
        syncUrl(nextFilters, nextPage, nextView);

        await refreshEvents({
            filters: nextFilters,
            page: nextPage,
            view: nextView
        });
    }, [
        activeView,
        refreshEvents,
        syncUrl
    ]);

    /* =============================
       PAGINATION CONTROLS
    ============================= */

    const { goToPreviousPage, goToNextPage } = usePagination({
        page: pagination.page,
        totalPages: pagination.totalPages,
        onPageChange: (nextPage) => loadDataAndSyncUrl(
            filters,
            nextPage,
            activeView
        )
    });

    /* =============================
       VIEW SWITCHING
    ============================= */

    const handleViewChange = async (nextView) => {
        const nextViewContent = getPublicUserEventViewContent(nextView);

        const nextFilters = {
            ...filters,
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

        loadInitialData({
            filters: initialFilters,
            page: initialPage,
            view: initialView
        });
    }, [
        loadInitialData,
        initialFilters,
        initialPage,
        initialView
    ]);

    /* =============================
       DISPLAY STATE
    ============================= */

    const showPaginationInfo = pagination.totalPages > 1;

    /* =============================
       INITIAL LOADING STATE
    ============================= */

    if (initialLoading) {
        return (
            <PageLoader
                title="Loading public profile..."
                description="Please wait while we load this user's public information."
            />
        );
    }

    /* =============================
       MAIN RENDER
    ============================= */

    return (
        <main className="container page-section">
            <header className="page-header">
                <div className="page-header-content">
                    <h1 id="public-user-page-title" className="page-title">
                        Public Profile
                    </h1>

                    <p className="page-subtitle">
                        View this user's public profile and events.
                    </p>
                </div>
            </header>

            {error && <Alert type="danger">{error}</Alert>}

            <section className="public-user-profile-section" aria-labelledby="public-user-profile-title">
                <Card>
                    <div className="public-user-profile-content">
                        <UserAvatar
                            src={avatar}
                            name={profile.user.name}
                            className="public-user-profile-avatar"
                        />

                        <div className="public-user-profile-info">
                            <h2 id="public-user-profile-title" className="section-title">
                                {profile.user.name}
                            </h2>

                            <p className="section-subtitle">
                                Public user profile.
                            </p>

                            <ul className="public-user-profile-stats" aria-label="Public user statistics">
                                <li className="public-user-profile-stat">
                                    <FolderOpen aria-hidden="true" />
                                    <strong>{profile.stats.createdEventsCount}</strong>{" "}
                                    created events
                                </li>

                                <li className="public-user-profile-stat">
                                    <Bookmark aria-hidden="true" />
                                    <strong>{profile.stats.joinedEventsCount}</strong>{" "}
                                    joined events
                                </li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </section>

            <section className="events-results-controls" aria-labelledby="public-user-events-title">
                <EventsToolbar
                    titleId="public-user-events-title"
                    title={viewContent.title}
                    subtitle={viewContent.subtitle}

                    totalEvents={pagination.totalEvents}
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    showPaginationInfo={showPaginationInfo}

                    views={PUBLIC_USER_EVENT_VIEWS}
                    activeView={activeView}
                    onViewChange={handleViewChange}

                    showQuickActions={false}
                />
            </section>

            <section className="events-results-section" aria-labelledby="public-user-events-title">
                {isLoading ? (
                    <LoadingState
                        title="Refreshing public events..."
                        description="Fetching the latest results."
                    />
                ) : events.length === 0 ? (
                    <EmptyState
                        title={viewContent.empty}
                        description="Try browsing another public user event section."
                    />
                ) : (
                    <div className="events-grid">
                        {events.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
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
                label="Public user events pagination"
            />
        </main>
    );
}
