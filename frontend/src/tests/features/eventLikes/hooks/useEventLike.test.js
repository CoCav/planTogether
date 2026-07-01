import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useEventLike from "../../../../features/eventLikes/hooks/useEventLike";

import { likeEvent, unlikeEvent } from "../../../../api/eventLikes/eventLikesApi";

/* ==================================================
   USE EVENT LIKE TESTS
   Tests event like mutation state

   Handles:
   - initial like state
   - like event mutation
   - unlike event mutation
   - local like state updates
   - parent like change callback
   - toast success feedback
   - toast error feedback
   - missing event ID guard
   - exposed manual state setters

   Notes:
   - API helpers are mocked
   - normalization is covered by eventLikeNormalizer tests
   - backend duplicate and auth behavior is tested server-side
================================================== */

/* =============================
   MOCKS
============================= */

vi.mock("../../../../api/eventLikes/eventLikesApi", () => ({
    likeEvent: vi.fn(),
    unlikeEvent: vi.fn()
}));

describe("useEventLike", () => {

    /* =============================
       TEST DATA
    ============================= */

    const toast = {
        success: vi.fn(),
        danger: vi.fn()
    };

    const onLikeChange = vi.fn();

    /* =============================
       TEST HELPERS
    ============================= */

    const renderUseEventLike = (props = {}) => {
        return renderHook(() =>
            useEventLike({
                eventId: 1,
                initialLiked: false,
                initialLikesCount: 0,
                toast,
                onLikeChange,
                ...props
            })
        );
    };

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();
    });

    /* =============================
       INITIAL STATE
    ============================= */

    it("should initialize like state", () => {
        const { result } = renderUseEventLike({
            initialLiked: true,
            initialLikesCount: 5
        });

        expect(result.current.likeState).toEqual({
            liked: true,
            likesCount: 5,
            isTogglingLike: false
        });
    });

    it("should normalize initial likes count fallback", () => {
        const { result } = renderUseEventLike({
            initialLikesCount: null
        });

        expect(result.current.likeState.likesCount).toBe(0);
    });

    /* =============================
       LIKE EVENT
    ============================= */

    it("should like an event and update local state", async () => {
        likeEvent.mockResolvedValue({
            eventId: 1,
            userId: 10,
            liked: true,
            likesCount: 3
        });

        const { result } = renderUseEventLike({
            initialLiked: false,
            initialLikesCount: 2
        });

        let returnedLike;

        await act(async () => {
            returnedLike = await result.current.likeActions.handleToggleLike();
        });

        expect(likeEvent).toHaveBeenCalledWith(1);
        expect(unlikeEvent).not.toHaveBeenCalled();

        expect(result.current.likeState).toMatchObject({
            liked: true,
            likesCount: 3,
            isTogglingLike: false
        });

        expect(returnedLike).toEqual({
            eventId: 1,
            userId: 10,
            liked: true,
            likesCount: 3
        });
    });

    it("should show success toast after liking an event", async () => {
        likeEvent.mockResolvedValue({
            eventId: 1,
            liked: true,
            likesCount: 3
        });

        const { result } = renderUseEventLike();

        await act(async () => {
            await result.current.likeActions.handleToggleLike();
        });

        expect(toast.success).toHaveBeenCalledWith("Event liked.");
    });

    /* =============================
       UNLIKE EVENT
    ============================= */

    it("should unlike an event and update local state", async () => {
        unlikeEvent.mockResolvedValue({
            eventId: 1,
            userId: 10,
            liked: false,
            likesCount: 2
        });

        const { result } = renderUseEventLike({
            initialLiked: true,
            initialLikesCount: 3
        });

        let returnedLike;

        await act(async () => {
            returnedLike = await result.current.likeActions.handleToggleLike();
        });

        expect(unlikeEvent).toHaveBeenCalledWith(1);
        expect(likeEvent).not.toHaveBeenCalled();

        expect(result.current.likeState).toMatchObject({
            liked: false,
            likesCount: 2,
            isTogglingLike: false
        });

        expect(returnedLike).toEqual({
            eventId: 1,
            userId: 10,
            liked: false,
            likesCount: 2
        });
    });

    it("should show success toast after unliking an event", async () => {
        unlikeEvent.mockResolvedValue({
            eventId: 1,
            liked: false,
            likesCount: 2
        });

        const { result } = renderUseEventLike({
            initialLiked: true,
            initialLikesCount: 3
        });

        await act(async () => {
            await result.current.likeActions.handleToggleLike();
        });

        expect(toast.success).toHaveBeenCalledWith("Event unliked.");
    });

    /* =============================
       PARENT UPDATE CALLBACK
    ============================= */

    it("should call onLikeChange with normalized like state", async () => {
        likeEvent.mockResolvedValue({
            eventId: 1,
            userId: 10,
            liked: true,
            likesCount: "4"
        });

        const { result } = renderUseEventLike();

        await act(async () => {
            await result.current.likeActions.handleToggleLike();
        });

        expect(onLikeChange).toHaveBeenCalledWith({
            eventId: 1,
            userId: 10,
            liked: true,
            likesCount: 4
        });
    });

    /* =============================
       ERROR HANDLING
    ============================= */

    it("should show error toast when like mutation fails", async () => {
        likeEvent.mockRejectedValue({});

        const { result } = renderUseEventLike();

        let returnedLike;

        await act(async () => {
            returnedLike = await result.current.likeActions.handleToggleLike();
        });

        expect(returnedLike).toBeNull();

        expect(toast.danger).toHaveBeenCalledWith("Unable to update event like");

        expect(result.current.likeState).toMatchObject({
            liked: false,
            likesCount: 0,
            isTogglingLike: false
        });
    });

    it("should return null when event ID is missing", async () => {
        const { result } = renderUseEventLike({
            eventId: null
        });

        let returnedLike;

        await act(async () => {
            returnedLike = await result.current.likeActions.handleToggleLike();
        });

        expect(returnedLike).toBeNull();

        expect(likeEvent).not.toHaveBeenCalled();
        expect(unlikeEvent).not.toHaveBeenCalled();
    });

    /* =============================
       MANUAL STATE SETTERS
    ============================= */

    it("should expose manual like state setters", () => {
        const { result } = renderUseEventLike();

        act(() => {
            result.current.likeActions.setLiked(true);
            result.current.likeActions.setLikesCount(9);
        });

        expect(result.current.likeState).toMatchObject({
            liked: true,
            likesCount: 9
        });
    });
});
