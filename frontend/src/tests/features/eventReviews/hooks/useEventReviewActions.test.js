import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useEventReviewActions from "../../../../features/eventReviews/hooks/useEventReviewActions";

import { createEventReview, deleteEventReview } from "../../../../api/eventReviews/eventReviewApi";
import { createMutationHookProps } from "../../../helpers/hooks/createHookProps";
import { mockConfirmAccepted, mockConfirmCancelled } from "../../../helpers/mocks/mockWindowConfirm";

/* ==================================================
   USE EVENT REVIEW ACTIONS HOOK TESTS
   Tests review mutation logic (create / delete)

   Handles:
   - review creation lifecycle
   - review deletion with confirmation
   - loading states (submit + delete)
   - error handling
   - success / failure return values

   Notes:
   - backend enforces ownership & permissions
   - loadReviews is triggered after successful mutations
   - window.confirm controls deletion flow
================================================== */

vi.mock("../../../../api/eventReviews/eventReviewApi", () => ({
    createEventReview: vi.fn(),
    deleteEventReview: vi.fn()
}));

describe("useEventReviewActions", () => {

    let hookProps;

    const loadReviews = vi.fn();
    const setMessage = vi.fn();
    const setError = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        hookProps = {
            ...createMutationHookProps({ eventId: 1 }),
            loadReviews,
            setMessage,
            setError
        };

        mockConfirmAccepted();
    });

    /* =============================
       HELPERS
    ============================= */

    const setupHook = () => renderHook(() => useEventReviewActions(hookProps));

    /* =============================
       CREATE REVIEW
    ============================= */

    it("should create review and refresh list", async () => {
        createEventReview.mockResolvedValue();

        const { result } = setupHook();

        let response;

        await act(async () => {
            response = await result.current.handleCreateReview({
                rating: 5,
                comment: "Great event!"
            });
        });

        expect(createEventReview).toHaveBeenCalledWith(1, {
            rating: 5,
            comment: "Great event!"
        });

        expect(setMessage).toHaveBeenCalledWith("Review added successfully");
        expect(setError).toHaveBeenCalledWith("");

        expect(loadReviews).toHaveBeenCalledTimes(1);
        expect(response).toBe(true);
        expect(result.current.isSubmitting).toBe(false);
    });

    it("should expose loading state during creation", async () => {
        let resolveCreate;

        createEventReview.mockImplementation(
            () => new Promise((resolve) => {
                resolveCreate = resolve;
            })
        );

        const { result } = setupHook();

        act(() => {
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

    it("should handle create error", async () => {
        createEventReview.mockRejectedValue(new Error("Request failed"));

        const { result } = setupHook();

        let response;

        await act(async () => {
            response = await result.current.handleCreateReview({
                rating: 5,
                comment: "Great event!"
            });
        });

        expect(setError).toHaveBeenCalledWith("Request failed");
        expect(loadReviews).not.toHaveBeenCalled();
        expect(response).toBe(false);
    });

    /* =============================
       DELETE REVIEW
    ============================= */

    it("should delete review when confirmed", async () => {
        deleteEventReview.mockResolvedValue();

        const { result } = setupHook();

        let response;

        await act(async () => {
            response = await result.current.handleDeleteReview(5);
        });

        expect(deleteEventReview).toHaveBeenCalledWith(5);

        expect(setMessage).toHaveBeenCalledWith("Review deleted successfully");
        expect(setError).toHaveBeenCalledWith("");

        expect(loadReviews).toHaveBeenCalledTimes(1);
        expect(response).toBe(true);
        expect(result.current.deletingReviewId).toBe(null);
    });

    it("should not delete when user cancels", async () => {
        mockConfirmCancelled();

        const { result } = setupHook();

        let response;

        await act(async () => {
            response = await result.current.handleDeleteReview(5);
        });

        expect(deleteEventReview).not.toHaveBeenCalled();
        expect(loadReviews).not.toHaveBeenCalled();
        expect(response).toBe(false);
    });

    it("should expose deleting state during delete", async () => {
        let resolveDelete;

        deleteEventReview.mockImplementation(
            () => new Promise((resolve) => {
                resolveDelete = resolve;
            })
        );

        const { result } = setupHook();

        act(() => {
            result.current.handleDeleteReview(5);
        });

        expect(result.current.deletingReviewId).toBe(5);

        await act(async () => {
            resolveDelete();
        });

        expect(result.current.deletingReviewId).toBe(null);
    });

    it("should handle delete error", async () => {
        deleteEventReview.mockRejectedValue(new Error("Request failed"));

        const { result } = setupHook();

        let response;

        await act(async () => {
            response = await result.current.handleDeleteReview(5);
        });

        expect(setError).toHaveBeenCalledWith("Request failed");
        expect(loadReviews).not.toHaveBeenCalled();
        expect(response).toBe(false);
    });
});
