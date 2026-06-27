import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, Search, ShieldCheck, Sparkles, Users } from "lucide-react";

import { useAuth } from "../features/auth/hooks/useAuth";

import useHomeEvents from "../features/events/hooks/useHomeEvents";

import useMembershipActions from "../features/eventMemberships/hooks/useMembershipActions";

import useToast from "../hooks/useToast";

import EventCard from "../components/events/EventCard";

import Alert from "../components/ui/Alert";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";

/* ==================================================
   HOME PAGE
   Displays the public landing page and latest events preview

   Handles:
   - hero and feature section rendering
   - guest and authenticated hero actions
   - latest events loading lifecycle
   - latest events loading, empty and error states
   - authenticated user event role forwarding
   - join and leave event actions
   - toast feedback forwarding for membership actions
   - accessible homepage sections
   - decorative hero and feature icons
   - auth-ready initial loading guard
================================================== */

export default function HomePage() {
    const { user, loading: authLoading } = useAuth();


    /* =============================
       TOAST FEEDBACK
    ============================= */

    const toast = useToast();


    /* =============================
       PAGE STATE
    ============================= */

    const [error, setError] = useState("");


    /* =============================
       HOME EVENTS
    ============================= */

    const { events, isLoading, loadData, getCurrentUserRoleByEvent } = useHomeEvents({
        user,
        setError
    });


    /* =============================
       MEMBERSHIP ACTIONS
    ============================= */

    const { handleJoinEvent, handleLeaveEvent } = useMembershipActions({
        loadData,
        toast,
        getCurrentUserRoleByEvent
    });


    /* =============================
       INITIAL DATA LOADING
    ============================= */

    // Prevents duplicate initial fetch in StrictMode
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        if (authLoading) return;

        if (hasLoadedRef.current) return;

        hasLoadedRef.current = true;

        loadData();
    }, [
        authLoading,
        loadData
    ]);


    /* =============================
       MAIN RENDER
    ============================= */

    return (
        <main className="container page-section">
            <section className="home-hero" aria-labelledby="home-hero-title">
                <div className="home-hero-top-row">
                    <p className="home-hero-label">
                        <Sparkles aria-hidden="true" />
                        Plan events together
                    </p>
                </div>

                <div className="home-hero-content">
                    <h1 id="home-hero-title" className="home-hero-title">
                        Organize, join, and manage events with ease
                    </h1>

                    <p className="home-hero-description">
                        PlanTogether helps you create events,
                        invite participants, manage roles,
                        and keep everything organized in one place.
                    </p>

                    <div className="home-hero-actions">

                        <Link to="/events" className="btn btn-primary">
                            Browse Events
                        </Link>

                        {user ? (
                            <Link to="/events/create" className="btn btn-outline">
                                Create Event
                            </Link>
                        ) : (
                            <Link to="/register" className="btn btn-outline">
                                Create Account
                            </Link>
                        )}

                    </div>
                </div>
            </section>

            <section className="home-section" aria-labelledby="home-features-title">
                <header className="section-header">
                    <h2 id="home-features-title" className="section-title">
                        Why PlanTogether?
                    </h2>

                    <p className="section-subtitle">
                        Everything you need to manage events collaboratively.
                    </p>
                </header>

                <div className="home-features-grid" role="list">

                    <Card className="card-interactive home-feature-card" role="listitem">
                        <div className="home-feature-header">
                            <div className="home-feature-icon" aria-hidden="true">
                                <CalendarPlus />
                            </div>

                            <h3 className="home-feature-title">
                                Create and manage events
                            </h3>
                        </div>

                        <p className="home-feature-text">
                            Set up events quickly with title,
                            date, location, type, and theme.
                        </p>
                    </Card>

                    <Card className="card-interactive home-feature-card" role="listitem">
                        <div className="home-feature-header">
                            <div className="home-feature-icon" aria-hidden="true">
                                <Users />
                            </div>
                            <h3 className="home-feature-title">
                                Join communities easily
                            </h3>
                        </div>

                        <p className="home-feature-text">
                            Browse events, join what interests you,
                            and leave when needed.
                        </p>
                    </Card>

                    <Card className="card-interactive home-feature-card" role="listitem">
                        <div className="home-feature-header">
                            <div className="home-feature-icon" aria-hidden="true">
                                <ShieldCheck />
                            </div>

                            <h3 className="home-feature-title">
                                Role-based collaboration
                            </h3>
                        </div>

                        <p className="home-feature-text">
                            Organizers, co-organizers,
                            and participants each have clear permissions.
                        </p>
                    </Card>

                    <Card className="card-interactive home-feature-card" role="listitem">
                        <div className="home-feature-header">
                            <div className="home-feature-icon" aria-hidden="true">
                                <Search />
                            </div>

                            <h3 className="home-feature-title">
                                Smart filtering
                            </h3>
                        </div>

                        <p className="home-feature-text">
                            Search by title, description,
                            type, theme, location, and date.
                        </p>
                    </Card>

                </div>
            </section>

            <section className="home-section" aria-labelledby="home-latest-events-title" aria-busy={isLoading}>
                <header className="section-header">
                    <h2 id="home-latest-events-title" className="section-title">
                        Latest Events
                    </h2>

                    <p className="section-subtitle">
                        Discover the most recently created events on PlanTogether.
                    </p>
                </header>

                {/* =============================
                   FEEDBACK MESSAGE
                ============================= */}

                {error && <Alert type="danger">{error}</Alert>}

                {isLoading ? (
                    <LoadingState
                        title="Loading latest events..."
                        description="Fetching the newest events on PlanTogether."
                    />
                ) : events.length === 0 ? (
                    <EmptyState title="No events yet." />
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
        </main>
    );
}
