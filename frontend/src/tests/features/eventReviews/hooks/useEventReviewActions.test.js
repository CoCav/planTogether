import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useEventReviewActions from "../../../../features/eventReviews/hooks/useEventReviewActions";

import { createEventReview, deleteEventReview } from "../../../../api/eventReviews/eventReviewApi";

import { createMutationHookProps } from "../../../helpers/hooks/createHookProps";
import { mockConfirmAccepted, mockConfirmCancelled } from "../../../helpers/mocks/mockWindowConfirm";

/* ==================================================
   USE EVENT REVIEW ACTIONS TESTS
   Tests current user event review actions

   Handles:
   - event review creation with rating and comment
   - review list refresh after creation
   - create error handling
   - review deletion confirmation
   - review deletion cancellation
   - review list refresh after deletion
   - delete error handling
   - submit and delete loading states

   Notes:
   - uses reusable mutation hook prop helpers
   - uses reusable confirmation dialog mock helpers
================================================== */

vi.mock("../../../../api/eventReviews/eventReviewApi", () => ({
    createEventReview: vi.fn(),
    deleteEventReview: vi.fn()
}));

describe("useEventReviewActions", () => {
    let hookProps;

    beforeEach(() => {
        vi.clearAllMocks();

        hookProps = {
            ...createMutationHookProps({
                eventId: 1
            }),
            loadReviews: vi.fn()
        };

        mockConfirmAccepted();
    });

    /* =============================
       TEST HELPERS
    ============================= */

    // Render event review actions hook
    const setupHook = () => {
        return renderHook(() =>
            useEventReviewActions(hookProps)
        );
    };

    /* =============================
       CREATE REVIEW
    ============================= */

    it("should create review and refresh reviews", async () => {
        createEventReview.mockResolvedValue();

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleCreateReview({
                rating: 5,
                comment: "Great event!"
            });
        });

        expect(hookProps.setMessage).toHaveBeenCalledWith("");
        expect(hookProps.setError).toHaveBeenCalledWith("");

        expect(createEventReview).toHaveBeenCalledWith(1, {
            rating: 5,
            comment: "Great event!"
        });

        expect(hookProps.setMessage).toHaveBeenCalledWith("Review added successfully");
        expect(hookProps.loadReviews).toHaveBeenCalledTimes(1);

        expect(result.current.isSubmitting).toBe(false);
    });

    it("should expose submit loading state while creating review", async () => {
        let resolveCreate;

        createEventReview.mockImplementation(() => new Promise((resolve) => {
            resolveCreate = resolve;
        }));

        const { result } = setupHook();

        await act(async () => {
            result.current.handleCreateReview({
                rating: 5,
                comment: "Great event!"
            });
        });

        expect(result.current.isSubmitting).toBe(true);

        await act(async () => {
            resolveCreate();
        });

        expect(result.current.isSubmitting).toBe(false);
    });

    it("should handle create review errors", async () => {
        createEventReview.mockRejectedValue(new Error("Request failed"));

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleCreateReview({
                rating: 5,
                comment: "Great event!"
            });
        });

        expect(hookProps.setError).toHaveBeenCalledWith("Request failed");
        expect(hookProps.loadReviews).not.toHaveBeenCalled();

        expect(result.current.isSubmitting).toBe(false);
    });

    /* =============================
       DELETE REVIEW
    ============================= */

    it("should delete review and refresh reviews when user confirms", async () => {
        deleteEventReview.mockResolvedValue();

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleDeleteReview(5);
        });

        expect(window.confirm).toHaveBeenCalledWith(
            "Are you sure you want to delete this review?"
        );

        expect(hookProps.setMessage).toHaveBeenCalledWith("");
        expect(hookProps.setError).toHaveBeenCalledWith("");

        expect(deleteEventReview).toHaveBeenCalledWith(5);

        expect(hookProps.setMessage).toHaveBeenCalledWith("Review deleted successfully");
        expect(hookProps.loadReviews).toHaveBeenCalledTimes(1);

        expect(result.current.deletingReviewId).toBe(null);
    });

    it("should not delete review when user cancels", async () => {
        mockConfirmCancelled();

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleDeleteReview(5);
        });

        expect(deleteEventReview).not.toHaveBeenCalled();
        expect(hookProps.loadReviews).not.toHaveBeenCalled();
    });

    it("should expose deleting review state while deleting review", async () => {
        let resolveDelete;

        deleteEventReview.mockImplementation(() => new Promise((resolve) => {
            resolveDelete = resolve;
        }));

        const { result } = setupHook();

        await act(async () => {
            result.current.handleDeleteReview(5);
        });

        expect(result.current.deletingReviewId).toBe(5);

        await act(async () => {
            resolveDelete();
        });

        expect(result.current.deletingReviewId).toBe(null);
    });

    it("should handle delete review errors", async () => {
        deleteEventReview.mockRejectedValue(new Error("Request failed"));

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleDeleteReview(5);
        });

        expect(hookProps.setError).toHaveBeenCalledWith("Request failed");
        expect(hookProps.loadReviews).not.toHaveBeenCalled();

        expect(result.current.deletingReviewId).toBe(null);
    });
});
