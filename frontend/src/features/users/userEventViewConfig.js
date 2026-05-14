/* ==================================================
   USER EVENT VIEW CONFIG
   Centralizes current user event tab configuration

   Handles:
   - tab labels and icons
   - section titles and subtitles
   - default sorting per view
   - quick filter visibility
   - date filter reset behavior

   Notes:
   - aligned with GET /users/me/events
================================================== */

export const DEFAULT_USER_EVENT_VIEW_CONTENT = {
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
};

/* =============================
   CURRENT USER EVENT VIEWS
============================= */

export const USER_EVENT_VIEWS = [
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

/* =============================
   VIEW CONTENT RESOLVER
============================= */

// Finds the active current user event view configuration
export const getUserEventViewContent = (activeView) => {
    return (
        USER_EVENT_VIEWS.find((view) => view.key === activeView) || DEFAULT_USER_EVENT_VIEW_CONTENT
    );
};
