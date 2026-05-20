import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import useEventForm from "../../../../features/events/hooks/useEventForm";

import { createDefaultEventFormValues } from "../../../../features/events/eventFormConfig";
import { EVENT_MODES } from "../../../../features/shared/eventModes";

/* ==================================================
   USE EVENT FORM TESTS
   Tests shared create/edit event form state

   Handles:
   - initial form state
   - field changes
   - online mode location reset
   - image changes
   - image removal
   - form helpers
   - validation errors
   - successful submit
   - submit error feedback

   Notes:
   - uses shared default event form values
   - submit behavior is injected by caller
================================================== */

describe("useEventForm", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const createValidValues = (overrides = {}) => ({
        ...createDefaultEventFormValues(),
        title: "React Meetup",
        description: "A meetup about React",
        type: "Meetup",
        theme: "Web",
        mode: EVENT_MODES.IN_PERSON,
        location: "Montreal",
        startDateTime: "2026-12-20T10:00",
        endDateTime: "2026-12-20T12:00",
        ...overrides
    });

    const createChangeEvent = ({ name, value }) => ({
        target: {
            name,
            value
        }
    });

    const createSubmitEvent = () => ({
        preventDefault: vi.fn()
    });

    const setupHook = ({
        initialValues = createValidValues(),
        onSubmitValid = vi.fn(),
        submitErrorMessage
    } = {}) => {
        const hook = renderHook(() =>
            useEventForm({
                initialValues,
                onSubmitValid,
                submitErrorMessage
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
        const initialValues = createValidValues();

        const { result } = setupHook({
            initialValues
        });

        expect(result.current.formState.values).toEqual(initialValues);
        expect(result.current.formState.fieldErrors).toEqual({});
        expect(result.current.feedback.pageError).toBe("");
        expect(result.current.submitState.isSubmitting).toBe(false);
    });

    it("should expose derived form helpers", () => {
        const { result } = setupHook({
            initialValues: createValidValues({
                mode: EVENT_MODES.ONLINE,
                registrationDeadlineOption: "custom"
            })
        });

        expect(result.current.formHelpers.isOnlineEvent).toBe(true);
        expect(result.current.formHelpers.showCustomDeadline).toBe(true);
    });

    /* =============================
       FIELD CHANGES
    ============================= */

    it("should update field value", () => {
        const { result } = setupHook();

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    name: "title",
                    value: "Updated title"
                })
            );
        });

        expect(result.current.formState.values.title).toBe("Updated title");
    });

    it("should clear field error when field changes", () => {
        const { result } = setupHook();

        act(() => {
            result.current.formState.setFieldErrors({
                title: "Title is required"
            });
        });

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    name: "title",
                    value: "Updated title"
                })
            );
        });

        expect(result.current.formState.fieldErrors.title).toBeUndefined();
    });

    it("should clear location when switching to online mode", () => {
        const { result } = setupHook({
            initialValues: createValidValues({
                mode: EVENT_MODES.IN_PERSON,
                location: "Montreal"
            })
        });

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    name: "mode",
                    value: EVENT_MODES.ONLINE
                })
            );
        });

        expect(result.current.formState.values.mode).toBe(EVENT_MODES.ONLINE);
        expect(result.current.formState.values.location).toBe("");
    });

    /* =============================
       IMAGE CHANGES
    ============================= */

    it("should update selected image", () => {
        const file = new File(["image"], "event.png", {
            type: "image/png"
        });

        const { result } = setupHook();

        act(() => {
            result.current.formActions.handleImageChange({
                target: {
                    files: [file]
                }
            });
        });

        expect(result.current.formState.values.image).toBe(file);
    });

    it("should set image to null when no image file is selected", () => {
        const { result } = setupHook();

        act(() => {
            result.current.formActions.handleImageChange({
                target: {
                    files: []
                }
            });
        });

        expect(result.current.formState.values.image).toBe(null);
    });

    it("should clear image error when image changes", () => {
        const file = new File(["image"], "event.png", {
            type: "image/png"
        });

        const { result } = setupHook();

        act(() => {
            result.current.formState.setFieldErrors({
                image: "Invalid image"
            });
        });

        act(() => {
            result.current.formActions.handleImageChange({
                target: {
                    files: [file]
                }
            });
        });

        expect(result.current.formState.fieldErrors.image).toBeUndefined();
    });

    it("should remove selected and current image", () => {
        const { result } = setupHook({
            initialValues: createValidValues({
                image: new File(["image"], "event.png", {
                    type: "image/png"
                }),
                currentImage: "old-event.png"
            })
        });

        act(() => {
            result.current.formActions.handleRemoveImage();
        });

        expect(result.current.formState.values.image).toBe(null);
        expect(result.current.formState.values.currentImage).toBe(null);
    });

    /* =============================
       SUBMIT
    ============================= */

    it("should clear page error before submitting again", async () => {
        const onSubmitValid = vi.fn();

        const { result } = setupHook({
            initialValues: createValidValues(),
            onSubmitValid
        });

        act(() => {
            result.current.feedback.setPageError("Previous error");
        });

        await act(async () => {
            await result.current.formActions.handleSubmit(createSubmitEvent());
        });

        expect(result.current.feedback.pageError).toBe("");
    });

    it("should submit valid values", async () => {
        const onSubmitValid = vi.fn();

        const { result } = setupHook({
            initialValues: createValidValues(),
            onSubmitValid
        });

        const submitEvent = createSubmitEvent();

        await act(async () => {
            await result.current.formActions.handleSubmit(submitEvent);
        });

        expect(submitEvent.preventDefault).toHaveBeenCalledTimes(1);
        expect(onSubmitValid).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "React Meetup"
            })
        );
        expect(result.current.formState.fieldErrors).toEqual({});
        expect(result.current.feedback.pageError).toBe("");
        expect(result.current.submitState.isSubmitting).toBe(false);
    });

    it("should set field errors when validation fails", async () => {
        const onSubmitValid = vi.fn();

        const { result } = setupHook({
            initialValues: createValidValues({
                title: ""
            }),
            onSubmitValid
        });

        await act(async () => {
            await result.current.formActions.handleSubmit(createSubmitEvent());
        });

        expect(onSubmitValid).not.toHaveBeenCalled();

        expect(result.current.formState.fieldErrors).toMatchObject({
            title: "Title is required"
        });
    });

    it("should set page error when submit fails", async () => {
        const onSubmitValid = vi.fn().mockRejectedValue(
            new Error("API error")
        );

        const { result } = setupHook({
            initialValues: createValidValues(),
            onSubmitValid,
            submitErrorMessage: "Failed to create event"
        });

        await act(async () => {
            await result.current.formActions.handleSubmit(createSubmitEvent());
        });

        expect(result.current.feedback.pageError).toBe("Failed to create event");
        expect(result.current.submitState.isSubmitting).toBe(false);
    });
});
