import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../features/auth/hooks/useAuth";

import useHomeEvents from "../features/events/hooks/useHomeEvents";

import useMembershipActions from "../features/eventMemberships/hooks/useMembershipActions";

import EventCard from "../components/events/EventCard";

import Alert from "../components/ui/Alert";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";

/* ==================================================
   HOME PAGE
   Displays the public landing page and latest events preview

   Handles:
   - hero and feature sections
   - latest event loading
   - authenticated user event roles
   - join and leave event actions
   - loading, empty and error states
================================================== */

export default function HomePage() {
    const { user } = useAuth();

    /* =============================
       PAGE STATE
    ============================= */

    const [message, setMessage] = useState("");
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
        setMessage,
        setError,
        getCurrentUserRoleByEvent
    });

    /* =============================
       INITIAL DATA LOADING
    ============================= */

    useEffect(() => {
        loadData();
    }, [loadData]);

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
    }, [message, error]);

    /* =============================
       MAIN RENDER
    ============================= */

    return (
        <main className="container page-section">
            <section className="home-hero" aria-labelledby="home-hero-title">
                <div className="home-hero-container">
                    <div className="home-hero-top-row">
                        <p className="home-hero-label">
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
                </div>
            </section>

            <section className="home-section" aria-labelledby="home-features-title">
                <div className="section-header">
                    <h2 id="home-features-title" className="section-title">
                        Why PlanTogether?
                    </h2>

                    <p className="section-subtitle">
                        Everything you need to manage events collaboratively.
                    </p>
                </div>

                <div className="home-features-grid">

                    <Card className="card-interactive">
                        <h3 className="home-feature-title">
                            Create and manage events
                        </h3>

                        <p className="home-feature-text">
                            Set up events quickly with title,
                            date, location, type, and theme.
                        </p>
                    </Card>

                    <Card className="card-interactive">
                        <h3 className="home-feature-title">
                            Join communities easily
                        </h3>

                        <p className="home-feature-text">
                            Browse events, join what interests you,
                            and leave when needed.
                        </p>
                    </Card>

                    <Card className="card-interactive">
                        <h3 className="home-feature-title">
                            Role-based collaboration
                        </h3>

                        <p className="home-feature-text">
                            Organizers, co-organizers,
                            and participants each have clear permissions.
                        </p>
                    </Card>

                    <Card className="card-interactive">
                        <h3 className="home-feature-title">
                            Smart filtering
                        </h3>

                        <p className="home-feature-text">
                            Search by title, description,
                            type, theme, location, and date.
                        </p>
                    </Card>

                </div>
            </section>

            <section className="home-section" aria-labelledby="home-latest-events-title" aria-busy={isLoading}>
                <div className="section-header">
                    <h2 id="home-latest-events-title" className="section-title">
                        Latest Events
                    </h2>

                    <p className="section-subtitle">
                        Discover the most recently created events on PlanTogether.
                    </p>
                </div>

                {message && <Alert type="success">{message}</Alert>}
                {error && <Alert type="danger">{error}</Alert>}

                {isLoading ? (
                    <LoadingState>
                        Loading events...
                    </LoadingState>
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
