import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import useEventReviewForm from "../../../../../features/eventReviews/hooks/forms/useEventReviewForm";

/* ==================================================
   USE EVENT REVIEW FORM TESTS
   Tests event review form state

   Handles:
   - initial form state
   - comment field changes
   - field error cleanup
   - validation errors
   - successful submit
   - trimmed submit payload
   - form reset
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

    /* =============================
       INITIAL STATE
    ============================= */

    it("should initialize form state", () => {
        const { result } = setupHook();

        expect(result.current.formState.values).toEqual({
            comment: ""
        });

        expect(result.current.formState.fieldErrors).toEqual({});
    });

    /* =============================
       FIELD CHANGES
    ============================= */

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
            comment: "Comment is required"
        });
    });

    it("should reject too short comments", async () => {
        const onSubmitValid = vi.fn();

        const { result } = setupHook({
            onSubmitValid
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
       SUBMIT
    ============================= */

    it("should submit valid comment", async () => {
        const onSubmitValid = vi.fn();

        const { result } = setupHook({
            onSubmitValid
        });

        const submitEvent = createSubmitEvent();

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    value: "Great event!"
                })
            );
        });

        await act(async () => {
            await result.current.formActions.handleSubmit(submitEvent);
        });

        expect(submitEvent.preventDefault).toHaveBeenCalledTimes(1);

        expect(onSubmitValid).toHaveBeenCalledWith({
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
            comment: "Great event!"
        });
    });

    it("should reset form after successful submit", async () => {
        const onSubmitValid = vi.fn();

        const { result } = setupHook({
            onSubmitValid
        });

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    value: "Great event!"
                })
            );
        });

        await act(async () => {
            await result.current.formActions.handleSubmit(createSubmitEvent());
        });

        expect(result.current.formState.values).toEqual({
            comment: ""
        });

        expect(result.current.formState.fieldErrors).toEqual({});
    });

    it("should reset form when resetForm is called", () => {
        const { result } = setupHook();

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    value: "Great event!"
                })
            );
        });

        act(() => {
            result.current.formActions.resetForm();
        });

        expect(result.current.formState.values).toEqual({
            comment: ""
        });

        expect(result.current.formState.fieldErrors).toEqual({});
    });
});
