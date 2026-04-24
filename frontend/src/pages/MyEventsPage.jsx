import { useState, useEffect } from "react";
import { getMyEvents } from "../api/eventMembershipApi";
import { getMyEventsWithRole } from "../features/events/normalizeData";
import useEventActionsWithConfirm from "../hooks/useEventActionsWithConfirm";

import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import EventCard from "../components/ui/EventCard";
import MyEventsViewTabs from "../components/ui/MyEventsViewTabs";
import Select from "../components/ui/Select";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";

/* ==================================================
   MY EVENTS PAGE
   Displays paginated events created or joined by the user
   Uses backend filtering, sorting and pagination
================================================== */
export default function MyEventsPage() {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Events list state: stores current page events
    const [events, setEvents] = useState([]);

    // Loading state: controls loading screen while events are fetched
    const [loading, setLoading] = useState(true);

    // View state: controls active event view
    const [activeView, setActiveView] = useState("created");

    // Sort state: maps UI sort option to backend sort params
    const [sortOption, setSortOption] = useState("startDateTime-asc");


    /* =========================
     Pagination state
       Controls current page and page size
    ========================= */
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 4,
        totalPages: 1,
        totalEvents: 0
    });


    /* =========================
     Sorting helpers
        Defines user-friendly labels for sorting options based on the current active view (upcoming vs history)
    ========================= */
    const getSortLabels = () => {
        if (activeView.includes("History")) {
            return {
                asc: "Oldest first",
                desc: "Most recent"
            };
        }

        return {
            asc: "Soonest first",
            desc: "Farthest first"
        };
    };

    // Compute labels dynamically for the current view
    const sortLabels = getSortLabels();


    /* =========================
     Data loading
       Fetches events for the selected view, page and sort option
    ========================= */
    const fetchMyEvents = async (
        customPage = pagination.page,
        customView = activeView,
        customSortOption = sortOption
    ) => {
        try {
            setError("");

            const [sortBy, order] = customSortOption.split("-");

            const response = await getMyEvents({
                view: customView,
                page: customPage,
                pageSize: pagination.pageSize,
                sortBy,
                order
            });

            setEvents(getMyEventsWithRole(response));

            setPagination((prev) => ({
                ...prev,
                page: response.data.page || 1,
                pageSize: response.data.pageSize || prev.pageSize,
                totalPages: response.data.totalPages || 1,
                totalEvents: response.data.totalEvents || 0
            }));
        } catch (error) {
            console.error("Error loading my events:", error);
            setError("❌ Failed to load your events");
        } finally {
            setLoading(false);
        }
    };


    /* =========================
     Effects
        Handles initial data loading and UI feedback lifecycle
    ========================= */

    // Initial data load: fetches first page of events when the component mounts
    // Uses default view and sorting configuration
    useEffect(() => {
        fetchMyEvents(1, activeView, sortOption);
    }, []);

    // Auto-clear feedback messages after delay
    useEffect(() => {
        if (message || error) {
            const timer = setTimeout(() => {
                setMessage("");
                setError("");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [message, error]);


    /* =========================
     Event actions
        Provides shared leave behavior and retrieves the current user role for the selected event
    ========================= */
    const getRoleByEventId = (eventId) =>
        events.find((event) => event.id === eventId)?.role || null;

    const { handleLeaveEvent } = useEventActionsWithConfirm({
        loadData: fetchMyEvents,
        setMessage,
        setError,
        getRoleByEventId
    });


    /* =========================
     Interaction handlers
        Keep UI state and backend data in sync when users change view, sorting, or pagination
    ========================= */
    const handleViewChange = async (nextView) => {
        setActiveView(nextView);
        await fetchMyEvents(1, nextView, sortOption);
    };

    const handleSortChange = async (e) => {
        const nextSortOption = e.target.value;
        setSortOption(nextSortOption);
        await fetchMyEvents(1, activeView, nextSortOption);
    };

    const handlePreviousPage = async () => {
        if (pagination.page <= 1) return;
        await fetchMyEvents(pagination.page - 1);
    };

    const handleNextPage = async () => {
        if (pagination.page >= pagination.totalPages) return;
        await fetchMyEvents(pagination.page + 1);
    };


    /* =========================
       View content
        Returns the title, subtitle and empty state message matching the active My Events tab
    ========================= */
    const getViewContent = () => {
        switch (activeView) {
            case "created":
                return {
                    title: "Created Events",
                    subtitle: "Events you created as organizer.",
                    empty: "You haven’t created any events yet."
                };
            case "createdHistory":
                return {
                    title: "Created History",
                    subtitle: "Explore past events you created.",
                    empty: "No past created events."
                };
            case "joined":
                return {
                    title: "Joined Events",
                    subtitle: "Events you joined.",
                    empty: "You haven’t joined any events yet."
                };
            case "joinedHistory":
                return {
                    title: "Joined History",
                    subtitle: "Explore past events you joined.",
                    empty: "No past joined events."
                };
            default:
                return {
                    title: "My Events",
                    subtitle: "",
                    empty: "No events found."
                };
        }
    };

    const viewContent = getViewContent();


    /* =========================
       Main render
    ========================= */
    return (
        <div className="container page-section">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Events</h1>
                    <p className="page-subtitle">View the events you created and joined.</p>
                </div>
            </div>

            {message && <Alert type="success">{message}</Alert>}
            {error && <Alert type="danger">{error}</Alert>}

            {loading ? (
                <LoadingState>Loading events...</LoadingState>
            ) : (
                <>
                    <div className="events-header">
                        <div className="events-header-top">
                            <h2 className="section-title">
                                {viewContent.title}
                                <span className="results-count">({pagination.totalEvents})</span> 
                            </h2>

                            {pagination.totalPages > 1 && (<span className="results-page-info">Page {pagination.page} of {pagination.totalPages}</span>)}
                        </div>

                        <p className="section-subtitle">{viewContent.subtitle}</p>
                        <div className="events-view-bar">
                            <MyEventsViewTabs activeView={activeView} onChange={handleViewChange}/>

                            <div className="events-view-actions">
                                <Select value={sortOption} onChange={handleSortChange}>
                                    <option value="startDateTime-asc">{sortLabels.asc}</option>
                                    <option value="startDateTime-desc">{sortLabels.desc}</option>
                                    <option value="title-asc">Title A-Z</option>
                                    <option value="title-desc">Title Z-A</option>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <section className="events-section">
                        {events.length === 0 ? (
                            <EmptyState>{viewContent.empty}</EmptyState>
                        ) : (
                            <div className="events-grid">
                                {events.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        user={true}
                                        role={event.role}
                                        onLeave={handleLeaveEvent}
                                        variant="my-events"
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {pagination.totalPages > 1 && (
                        <div className="pagination">
                            <Button type="button" variant="outline" onClick={handlePreviousPage} disabled={pagination.page === 1}>Previous</Button>
                            <span className="pagination-info">Page {pagination.page} of {pagination.totalPages}</span>
                            <Button type="button" variant="outline" onClick={handleNextPage} disabled={pagination.page === pagination.totalPages}>Next</Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}