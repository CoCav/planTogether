/* ==================================================
   EVENT VIEW CONFIG
   Centralizes tab configuration for event pages

   Handles:
   - tab labels and icons
   - section titles and subtitles
   - empty state messages
   - backend status filters
   - default sorting per view
   - quick filter visibility
   - date filter reset behavior
================================================== */

export const DEFAULT_VIEW_CONTENT = {
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


/* =========================
   Public event views
   Used by EventsPage
========================= */

export const PUBLIC_EVENT_VIEWS = [
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
        key: "upcoming",
        label: "Upcoming",
        icon: "📅",
        title: "Upcoming Events",
        subtitle: "Discover upcoming events and plan ahead.",
        empty: "No upcoming events.",
        status: "upcoming",
        defaultSortBy: "startDateTime",
        defaultOrder: "asc",
        showQuickActions: true,
        clearDateFiltersOnEnter: false
    },
    {
        key: "archives",
        label: "Archives",
        icon: "🗂️",
        title: "Archives",
        subtitle: "Explore past events.",
        empty: "No archived events.",
        status: "past",
        defaultSortBy: "startDateTime",
        defaultOrder: "desc",
        showQuickActions: false,
        clearDateFiltersOnEnter: true
    }
];


/* =========================
   User event views
   Used by MyEventsPage
========================= */

export const MY_EVENT_VIEWS = [
    {
        key: "created",
        label: "Created",
        icon: "🛠️",
        title: "Created Events",
        subtitle: "Events you created as organizer.",
        empty: "You haven’t created any events yet.",
        defaultSortBy: "startDateTime",
        defaultOrder: "asc",
        showQuickActions: true,
        clearDateFiltersOnEnter: false
    },
    {
        key: "createdHistory",
        label: "Created History",
        icon: "📜",
        title: "Created History",
        subtitle: "Explore past events you created.",
        empty: "No past created events.",
        defaultSortBy: "startDateTime",
        defaultOrder: "desc",
        showQuickActions: false,
        clearDateFiltersOnEnter: true
    },
    {
        key: "joined",
        label: "Joined",
        icon: "🤝",
        title: "Joined Events",
        subtitle: "Events you joined.",
        empty: "You haven’t joined any events yet.",
        defaultSortBy: "startDateTime",
        defaultOrder: "asc",
        showQuickActions: true,
        clearDateFiltersOnEnter: false
    },
    {
        key: "joinedHistory",
        label: "Joined History",
        icon: "🗂️",
        title: "Joined History",
        subtitle: "Explore past events you joined.",
        empty: "No past joined events.",
        defaultSortBy: "startDateTime",
        defaultOrder: "desc",
        showQuickActions: false,
        clearDateFiltersOnEnter: true
    }
];


/* =========================
   View content resolver
   Finds the active view configuration
========================= */

export const getViewContent = (views, activeView) => views.find((view) => view.key === activeView) || DEFAULT_VIEW_CONTENT;
