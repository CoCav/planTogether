import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import useEventReviewForm from "../../../../../features/eventReviews/hooks/forms/useEventReviewForm";

/* ==================================================
   USE EVENT REVIEW FORM
   Manages event review form state and validation flow

   Handles:
   - rating and comment values
   - field validation errors
   - rating selection changes
   - comment field changes
   - form validation on submit
   - submit flow with async callback
   - automatic reset after successful submit

   Notes:
   - validation is handled via validateEventReview
   - onSubmitValid is provided by parent (API layer)
   - reset only happens if submit is successful
================================================== */

describe("useEventReviewForm", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const createChangeEvent = ({ name = "comment", value }) => ({
        target: {
            name,
            value
        }
    });

    const createSubmitEvent = () => ({
        preventDefault: vi.fn()
    });

    const setupHook = ({
        onSubmitValid = vi.fn()
    } = {}) => {
        const hook = renderHook(() =>
            useEventReviewForm({
                onSubmitValid
            })
        );

        return {
            ...hook,
            onSubmitValid
        };
    };

    const fillValidForm = (result) => {
        act(() => {
            result.current.formActions.handleRatingChange(5);
        });

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    value: "Great event!"
                })
            );
        });
    };

    /* =============================
       INITIAL STATE
    ============================= */

    it("should initialize form state", () => {
        const { result } = setupHook();

        expect(result.current.formState.values).toEqual({
            rating: "",
            comment: ""
        });

        expect(result.current.formState.fieldErrors).toEqual({});
    });

    /* =============================
       FIELD CHANGES
    ============================= */

    it("should update rating value", () => {
        const { result } = setupHook();

        act(() => {
            result.current.formActions.handleRatingChange(4);
        });

        expect(result.current.formState.values.rating).toBe(4);
    });

    it("should update comment value", () => {
        const { result } = setupHook();

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    value: "Great event!"
                })
            );
        });

        expect(result.current.formState.values.comment).toBe("Great event!");
    });

    it("should clear rating error when rating changes", async () => {
        const { result } = setupHook();

        await act(async () => {
            await result.current.formActions.handleSubmit(createSubmitEvent());
        });

        expect(result.current.formState.fieldErrors.rating).toBe("Rating is required");

        act(() => {
            result.current.formActions.handleRatingChange(5);
        });

        expect(result.current.formState.fieldErrors.rating).toBeUndefined();
    });

    it("should clear comment error when comment changes", async () => {
        const { result } = setupHook();

        await act(async () => {
            await result.current.formActions.handleSubmit(createSubmitEvent());
        });

        expect(result.current.formState.fieldErrors.comment).toBe("Comment is required");

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    value: "Great event!"
                })
            );
        });

        expect(result.current.formState.fieldErrors.comment).toBeUndefined();
    });

    /* =============================
       VALIDATION ERRORS
    ============================= */

    it("should set field errors when validation fails", async () => {
        const onSubmitValid = vi.fn();

        const { result } = setupHook({
            onSubmitValid
        });

        await act(async () => {
            await result.current.formActions.handleSubmit(createSubmitEvent());
        });

        expect(onSubmitValid).not.toHaveBeenCalled();

        expect(result.current.formState.fieldErrors).toMatchObject({
            rating: "Rating is required",
            comment: "Comment is required"
        });
    });

    it("should reject too short comments", async () => {
        const onSubmitValid = vi.fn();

        const { result } = setupHook({
            onSubmitValid
        });

        act(() => {
            result.current.formActions.handleRatingChange(5);
        });

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    value: "bad"
                })
            );
        });

        await act(async () => {
            await result.current.formActions.handleSubmit(createSubmitEvent());
        });

        expect(onSubmitValid).not.toHaveBeenCalled();

        expect(result.current.formState.fieldErrors).toMatchObject({
            comment: "Comment must be between 5 and 1000 characters"
        });
    });

    /* =============================
       EDGE CASES
    ============================= */

    it("should not crash if onSubmitValid is undefined", async () => {
        const { result } = renderHook(() =>
            useEventReviewForm({})
        );

        act(() => {
            result.current.formActions.handleRatingChange(5);
            result.current.formActions.handleFieldChange({
                target: { name: "comment", value: "Great event!" }
            });
        });

        await act(async () => {
            await result.current.formActions.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(result.current.formState.values).toEqual({
            rating: "",
            comment: ""
        });
    });

    it("should handle missing onSubmitValid safely", async () => {
        const { result } = renderHook(() =>
            useEventReviewForm({})
        );

        act(() => {
            result.current.formActions.handleRatingChange(5);
            result.current.formActions.handleFieldChange({
                target: { name: "comment", value: "Great event!" }
            });
        });

        await act(async () => {
            await result.current.formActions.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(result.current.formState.values).toEqual({
            rating: "",
            comment: ""
        });
    });

    /* =============================
       SUBMIT
    ============================= */

    it("should submit valid review", async () => {
        const onSubmitValid = vi.fn();

        const { result } = setupHook({
            onSubmitValid
        });

        const submitEvent = createSubmitEvent();

        fillValidForm(result);

        await act(async () => {
            await result.current.formActions.handleSubmit(submitEvent);
        });

        expect(submitEvent.preventDefault).toHaveBeenCalledTimes(1);

        expect(onSubmitValid).toHaveBeenCalledWith({
            rating: 5,
            comment: "Great event!"
        });

        expect(result.current.formState.fieldErrors).toEqual({});
    });

    it("should submit trimmed comment", async () => {
        const onSubmitValid = vi.fn();

        const { result } = setupHook({
            onSubmitValid
        });

        act(() => {
            result.current.formActions.handleRatingChange(5);
        });

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    value: "   Great event!   "
                })
            );
        });

        await act(async () => {
            await result.current.formActions.handleSubmit(createSubmitEvent());
        });

        expect(onSubmitValid).toHaveBeenCalledWith({
            rating: 5,
            comment: "Great event!"
        });
    });

    it("should reset form after successful submit", async () => {
        const onSubmitValid = vi.fn();

        const { result } = setupHook({
            onSubmitValid
        });

        fillValidForm(result);

        await act(async () => {
            await result.current.formActions.handleSubmit(createSubmitEvent());
        });

        expect(result.current.formState.values).toEqual({
            rating: "",
            comment: ""
        });

        expect(result.current.formState.fieldErrors).toEqual({});
    });

    it("should not reset form when submit returns false", async () => {
        const onSubmitValid = vi.fn().mockResolvedValue(false);

        const { result } = setupHook({ onSubmitValid });

        fillValidForm(result);

        await act(async () => {
            await result.current.formActions.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(result.current.formState.values.rating).toBe(5);
        expect(result.current.formState.values.comment).toBe("Great event!");
    });

    it("should reset form when resetForm is called", () => {
        const { result } = setupHook();

        fillValidForm(result);

        act(() => {
            result.current.formActions.resetForm();
        });

        expect(result.current.formState.values).toEqual({
            rating: "",
            comment: ""
        });

        expect(result.current.formState.fieldErrors).toEqual({});
    });
});
