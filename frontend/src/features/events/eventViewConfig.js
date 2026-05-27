import { EVENT_STATUS } from "../shared/constants/eventStatus";

/* ==================================================
   EVENT VIEW CONFIG
   Centralizes public event tab configuration

   Handles:
   - tab labels and icons
   - section titles and subtitles
   - backend status filters
   - default sorting per view
   - quick filter visibility
   - date filter reset behavior

   Notes:
   - aligned with GET /events
   - current user event views belong to features/users
================================================== */

export const DEFAULT_EVENT_VIEW_CONTENT = {
    key: "default",
    label: "Events",
    icon: "📋",
    title: "Events",
    subtitle: "",
    empty: "No events found.",
    status: "",
    defaultSortBy: "createdAt",
    defaultOrder: "desc",
    showQuickActions: true,
    clearDateFiltersOnEnter: false
};

/* =============================
   PUBLIC EVENT VIEWS
============================= */

export const PUBLIC_EVENT_VIEWS = [
    {
        key: EVENT_STATUS.ONGOING,
        label: "Ongoing",
        icon: "⏳",
        title: "Ongoing Events",
        subtitle: "See events currently happening.",
        empty: "No ongoing events.",
        status: EVENT_STATUS.ONGOING,
        defaultSortBy: "startDateTime",
        defaultOrder: "asc",
        showQuickActions: true,
        clearDateFiltersOnEnter: false
    },
    {
        key: EVENT_STATUS.UPCOMING,
        label: "Upcoming",
        icon: "📅",
        title: "Upcoming Events",
        subtitle: "Discover upcoming events and plan ahead.",
        empty: "No upcoming events.",
        status: EVENT_STATUS.UPCOMING,
        defaultSortBy: "startDateTime",
        defaultOrder: "asc",
        showQuickActions: true,
        clearDateFiltersOnEnter: false
    },

    {
        key: "all",
        label: "All",
        icon: "📋",
        title: "All Events",
        subtitle: "Browse all events and refine your search.",
        empty: "No events found.",
        status: "",
        defaultSortBy: "createdAt",
        defaultOrder: "desc",
        showQuickActions: true,
        clearDateFiltersOnEnter: false
    },

    {
        key: EVENT_STATUS.PAST,
        label: "Archives",
        icon: "🗂️",
        title: "Archives",
        subtitle: "Explore past events.",
        empty: "No archived events.",
        status: EVENT_STATUS.PAST,
        defaultSortBy: "startDateTime",
        defaultOrder: "desc",
        showQuickActions: false,
        clearDateFiltersOnEnter: true
    }
];

/* =============================
   VIEW CONTENT RESOLVER
============================= */

// Finds the active public event view configuration
export const getEventViewContent = (activeView) => {
    return (
        PUBLIC_EVENT_VIEWS.find(
            (view) => view.key === activeView
        ) || DEFAULT_EVENT_VIEW_CONTENT
    );
};
