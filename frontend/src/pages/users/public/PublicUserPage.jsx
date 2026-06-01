import { useEffect } from "react";
import { useParams } from "react-router-dom";

import usePublicUserListingData from "../../../features/users/public/hooks/usePublicUserListingData";

import { PUBLIC_USER_EVENT_VIEWS } from "../../../features/users/public/publicUserEventViewConfig";

import EventCard from "../../../components/events/EventCard";
import EventViewTabs from "../../../components/events/EventViewTabs";

import UserAvatar from "../../../components/users/UserAvatar";
import { getAvatar } from "../../../utils/uploadedFiles";

import Alert from "../../../components/ui/Alert";
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/ui/EmptyState";
import PageLoader from "../../../components/ui/PageLoader";

/* ==================================================
   PUBLIC USER PAGE
   Displays a public user profile and public event lists

   Handles:
   - public profile display
   - public created/joined event views
   - loading, error and empty states
================================================== */

export default function PublicUserPage() {
    const { userId } = useParams();

    const {
        profile,
        visibleEvents,

        activeView,
        setActiveView,

        viewContent,

        initialLoading,

        error,

        loadData
    } = usePublicUserListingData(userId);

    const avatar = getAvatar(profile.user.avatar);

    /* =============================
       INITIAL DATA LOADING
    ============================= */

    useEffect(() => {
        loadData();
    }, [
        loadData
    ]);

    /* =============================
       LOADING STATE
    ============================= */

    if (initialLoading) {
        return (
            <PageLoader>
                Loading public profile...
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
                    <h1 id="public-user-page-title" className="page-title">
                        Public Profile
                    </h1>

                    <p className="page-subtitle">
                        View this user's public profile and events.
                    </p>
                </div>
            </header>

            {error && <Alert type="danger">{error}</Alert>}

            <Card>
                <section aria-labelledby="public-user-profile-title">
                    <header className="section-header">
                        <div className="user-profile-header">
                            <UserAvatar
                                src={avatar}
                                name={profile.user.name}
                                className="user-profile-avatar"
                            />

                            <div>
                                <h2 id="public-user-profile-title" className="section-title">
                                    {profile.user.name}
                                </h2>

                                <p className="section-subtitle">
                                    Public user profile.
                                </p>
                            </div>
                        </div>
                    </header>

                    <div className="user-profile-stats">
                        <p>
                            <strong>
                                {profile.stats.createdEventsCount}
                            </strong>{" "}
                            created events
                        </p>

                        <p>
                            <strong>
                                {profile.stats.joinedEventsCount}
                            </strong>{" "}
                            joined events
                        </p>
                    </div>
                </section>
            </Card>

            <section className="events-results-controls" aria-labelledby="public-user-events-title">
                <div className="events-results-header">
                    <div className="events-results-meta">
                        <div>
                            <h2 id="public-user-events-title" className="section-title">
                                {viewContent.title}

                                <span className="events-results-count">
                                    ({visibleEvents.length})
                                </span>
                            </h2>

                            <p className="section-subtitle">
                                {viewContent.subtitle}
                            </p>
                        </div>
                    </div>

                    <div className="events-view-controls">
                        <EventViewTabs
                            views={PUBLIC_USER_EVENT_VIEWS}
                            activeView={activeView}
                            onChange={setActiveView}
                        />
                    </div>
                </div>
            </section>

            <section className="events-results-section" aria-labelledby="public-user-events-title">
                {visibleEvents.length === 0 ? (
                    <EmptyState
                        title={viewContent.empty}
                        description="Try browsing another public user event section."
                    />
                ) : (
                    <div className="events-grid">
                        {visibleEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
