import { useMemo, useState } from "react";

import usePagination from "../../../hooks/usePagination";

/* ==================================================
   USE MEMBER LIST PAGINATION
   Handles local member list preview and pagination

   Handles:
   - collapsed preview members
   - expanded member list state
   - local page state
   - visible member slicing
   - total page calculation
   - previous and next page navigation
   - view all / collapse action visibility
================================================== */

export default function useMemberListPagination({
    members = [],
    previewLimit = 4,
    pageSize = 4
}) {

    /* =============================
       EXPANSION STATE
    ============================= */

    const [isExpanded, setIsExpanded] = useState(false);

    /* =============================
       PAGINATION STATE
    ============================= */

    const [page, setPage] = useState(1);

    /* =============================
       PAGINATION METADATA
    ============================= */

    const totalPages = Math.max(
        1,
        Math.ceil(members.length / pageSize)
    );

    /* =============================
       TOGGLE VISIBILITY
    ============================= */

    // Shows the "View all" button only when
    // the member count exceeds the preview limit
    const showToggle = members.length > previewLimit;

    /* =============================
       VISIBLE MEMBERS
    ============================= */

    // Shows a limited preview while collapsed
    // and paginated members while expanded
    const visibleMembers = useMemo(() => {

        if (!isExpanded) {
            return members.slice(0, previewLimit);
        }

        const startIndex = (page - 1) * pageSize;

        const endIndex = startIndex + pageSize;

        return members.slice(startIndex, endIndex);

    }, [
        members,
        isExpanded,
        page,
        pageSize,
        previewLimit
    ]);

    /* =============================
       EXPANSION HANDLERS
    ============================= */

    const handleViewAll = () => {
        setIsExpanded(true);
        setPage(1);
    };

    const handleCollapse = () => {
        setIsExpanded(false);
        setPage(1);
    };

    /* =============================
       PAGINATION NAVIGATION
    ============================= */

    const { goToPreviousPage, goToNextPage } = usePagination({
        page,
        totalPages,
        onPageChange: setPage
    });

    /* =============================
       RETURN VALUES
    ============================= */

    return {
        page,
        totalPages,

        isExpanded,

        visibleMembers,

        showToggle,
        showPagination: isExpanded && totalPages > 1,

        handleViewAll,
        handleCollapse,

        goToPreviousPage,
        goToNextPage
    };
}
