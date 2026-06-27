import { useId } from "react";
import { Link } from "react-router-dom";

import useMemberListPagination from "../../features/eventMemberships/hooks/useMemberListPagination";

import { getAvatar } from "../../utils/uploadedFiles";

import UserAvatar from "../users/UserAvatar";

import Badge from "../ui/Badge";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import Pagination from "../ui/Pagination";

/* ==================================================
   EVENT MEMBERS SECTION
   Displays event membership lists with optional actions

   Handles:
   - accessible section heading association
   - section heading, subtitle and optional icon
   - empty member state
   - public profile navigation
   - member avatar rendering
   - member identity and role display
   - optional role badges
   - optional member action rendering
   - collapsed member preview
   - expanded paginated member list
   - view all / collapse toggle state
   - local pagination controls
   - accessible list semantics
================================================== */

export default function EventMembersSection({
    title,
    subtitle,
    icon: Icon,

    members = [],

    showRoleBadge = true,
    showActions = true,

    emptyMessage = "No members found.",
    renderActions,

    previewLimit = 4,
    pageSize = 4
}) {
    const sectionTitleId = useId();

    /* =============================
       MEMBER LIST STATE
    ============================= */

    const {
        page,
        totalPages,
        isExpanded,
        visibleMembers,
        showToggle,
        showPagination,
        handleViewAll,
        handleCollapse,
        goToPreviousPage,
        goToNextPage
    } = useMemberListPagination({
        members,
        previewLimit,
        pageSize
    });

    const toggleLabel = isExpanded ? "Collapse" : "View all";
    const handleToggle = isExpanded ? handleCollapse : handleViewAll;

    return (
        <section aria-labelledby={sectionTitleId}>
            {/* =============================
                HEADER
            ============================= */}

            <div className="event-members-header">
                {Icon && (
                    <div className="event-members-header-icon" aria-hidden="true">
                        <Icon />
                    </div>
                )}

                <div className="event-members-header-content">
                    <div className="event-members-header-top">
                        <div>
                            <h2 id={sectionTitleId} className="section-title">
                                {title}
                            </h2>

                            {subtitle && (
                                <p className="section-subtitle">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        {showToggle && (
                            <Button
                                type="button"
                                variant="outline"
                                className="event-members-toggle"
                                onClick={handleToggle}
                                aria-expanded={isExpanded}
                            >
                                {toggleLabel}
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* =============================
                EMPTY STATE
            ============================= */}

            {members.length === 0 ? (
                <EmptyState>
                    {emptyMessage}
                </EmptyState>
            ) : (
                <>
                    {/* =============================
                        MEMBER LIST
                    ============================= */}

                    <div className="member-list" role="list">
                        {visibleMembers.map((person) => (
                            <div key={person.id} className="member-row" role="listitem">
                                <div className="member-info">
                                    <Link
                                        to={`/users/${person.id}`}
                                        className="member-avatar-link"
                                        aria-label={`View ${person.name ?? "member"} profile`}
                                    >
                                        <UserAvatar
                                            src={getAvatar(person.avatar)}
                                            name={person.name}
                                            className="member-avatar"
                                        />
                                    </Link>

                                    <div className="member-meta">
                                        <Link
                                            to={`/users/${person.id}`}
                                            className="member-name link-hover-primary"
                                        >
                                            {person.name}
                                        </Link>

                                        {showRoleBadge && (
                                            <Badge role={person.role} />
                                        )}
                                    </div>
                                </div>

                                {showActions && renderActions && (
                                    <div className="member-actions">
                                        {renderActions(person)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* =============================
                        PAGINATION
                    ============================= */}

                    {showPagination && (
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            onPrevious={goToPreviousPage}
                            onNext={goToNextPage}
                            label={`${title} pagination`}
                        />
                    )}
                </>
            )}
        </section>
    );
}
