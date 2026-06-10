import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import useMemberListPagination from "../../../../features/eventMemberships/hooks/useMemberListPagination";

/* ==================================================
   USE MEMBER LIST PAGINATION TESTS
   Tests local member preview and pagination logic

   Handles:
   - collapsed preview members
   - view all toggle visibility
   - expanded member list state
   - local page slicing
   - previous and next page navigation
   - pagination visibility
   - collapse behavior
================================================== */

describe("useMemberListPagination", () => {

    /* =============================
       TEST DATA
    ============================= */

    const members = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
        { id: 4, name: "Diana" },
        { id: 5, name: "Eve" }
    ];

    /* =============================
       TEST HELPERS
    ============================= */

    const renderUseMemberListPagination = (options = {}) => {
        return renderHook(() =>
            useMemberListPagination({
                members: options.members ?? members,
                previewLimit: options.previewLimit ?? 2,
                pageSize: options.pageSize ?? 2
            })
        );
    };

    /* =============================
       INITIAL STATE
    ============================= */

    it("should initialize collapsed state", () => {
        const { result } = renderUseMemberListPagination();

        expect(result.current.isExpanded).toBe(false);
        expect(result.current.page).toBe(1);
    });

    it("should show preview members while collapsed", () => {
        const { result } = renderUseMemberListPagination();

        expect(result.current.visibleMembers).toEqual([
            members[0],
            members[1]
        ]);
    });

    it("should show toggle when member count exceeds preview limit", () => {
        const { result } = renderUseMemberListPagination();

        expect(result.current.showToggle).toBe(true);
    });

    it("should hide toggle when member count does not exceed preview limit", () => {
        const { result } = renderUseMemberListPagination({
            members: members.slice(0, 2),
            previewLimit: 2
        });

        expect(result.current.showToggle).toBe(false);
    });

    /* =============================
       EXPANDED STATE
    ============================= */

    it("should expand list and reset page when viewing all members", () => {
        const { result } = renderUseMemberListPagination();

        act(() => {
            result.current.handleViewAll();
        });

        expect(result.current.isExpanded).toBe(true);
        expect(result.current.page).toBe(1);
        expect(result.current.visibleMembers).toEqual([
            members[0],
            members[1]
        ]);
    });

    it("should show pagination only when expanded and multiple pages exist", () => {
        const { result } = renderUseMemberListPagination();

        expect(result.current.showPagination).toBe(false);

        act(() => {
            result.current.handleViewAll();
        });

        expect(result.current.showPagination).toBe(true);
        expect(result.current.totalPages).toBe(3);
    });

    it("should hide pagination when expanded list has one page", () => {
        const { result } = renderUseMemberListPagination({
            members: members.slice(0, 2),
            pageSize: 4
        });

        act(() => {
            result.current.handleViewAll();
        });

        expect(result.current.showPagination).toBe(false);
        expect(result.current.totalPages).toBe(1);
    });

    /* =============================
       PAGE NAVIGATION
    ============================= */

    it("should go to next page when expanded", async () => {
        const { result } = renderUseMemberListPagination();

        act(() => {
            result.current.handleViewAll();
        });

        await act(async () => {
            await result.current.goToNextPage();
        });

        expect(result.current.page).toBe(2);
        expect(result.current.visibleMembers).toEqual([
            members[2],
            members[3]
        ]);
    });

    it("should go to previous page when available", async () => {
        const { result } = renderUseMemberListPagination();

        act(() => {
            result.current.handleViewAll();
        });

        await act(async () => {
            await result.current.goToNextPage();
        });

        await act(async () => {
            await result.current.goToPreviousPage();
        });

        expect(result.current.page).toBe(1);
        expect(result.current.visibleMembers).toEqual([
            members[0],
            members[1]
        ]);
    });

    it("should not go past the last page", async () => {
        const { result } = renderUseMemberListPagination();

        act(() => {
            result.current.handleViewAll();
        });

        await act(async () => {
            await result.current.goToNextPage();
        });

        await act(async () => {
            await result.current.goToNextPage();
        });

        await act(async () => {
            await result.current.goToNextPage();
        });

        expect(result.current.page).toBe(3);
        expect(result.current.visibleMembers).toEqual([
            members[4]
        ]);
    });

    /* =============================
       EMPTY STATE
    ============================= */

    it("should handle empty members list", () => {
        const { result } = renderUseMemberListPagination({
            members: []
        });

        expect(result.current.totalPages).toBe(1);
        expect(result.current.visibleMembers).toEqual([]);
        expect(result.current.showToggle).toBe(false);
        expect(result.current.showPagination).toBe(false);
    });

    /* =============================
       COLLAPSE
    ============================= */

    it("should collapse list and reset page", async () => {
        const { result } = renderUseMemberListPagination();

        act(() => {
            result.current.handleViewAll();
        });

        await act(async () => {
            await result.current.goToNextPage();
        });

        act(() => {
            result.current.handleCollapse();
        });

        expect(result.current.isExpanded).toBe(false);
        expect(result.current.page).toBe(1);
        expect(result.current.visibleMembers).toEqual([
            members[0],
            members[1]
        ]);
    });
});
