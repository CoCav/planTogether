import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import useEventForm from "../../../../../features/events/hooks/form/useEventForm";

import { createDefaultEventFormValues } from "../../../../../features/events/form/eventFormConfig";
import { EVENT_MODES } from "../../../../../features/shared/constants/eventModes";
import { EVENT_REGISTRATION_DEADLINES } from "../../../../../features/shared/constants/eventRegistrationDeadlines";

/* ==================================================
   USE EVENT FORM TESTS
   Tests shared create/edit event form state

   Handles:
   - initial form state
   - field changes
   - selected and structured location state
   - dependent field resets
   - online mode location reset
   - formatted selected location state
   - image changes
   - image removal
   - form helpers
   - location suggestion selection
   - configurable validation options
   - validation errors
   - successful submit
   - submit error feedback

   Notes:
   - uses shared default event form values
   - submit behavior is injected by caller
   - selectedLocation is UI-only state for autocomplete/map preview
   - event-specific edit rules are provided through validation options
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
        submitErrorMessage,
        validationOptions
    } = {}) => {
        const hook = renderHook(() =>
            useEventForm({
                initialValues,
                onSubmitValid,
                submitErrorMessage,
                validationOptions
            })
        );

        return {
            ...hook,
            onSubmitValid
        };
    };

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.useFakeTimers();

        vi.setSystemTime(new Date("2026-05-20T12:00:00"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

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
        expect(result.current.feedback.error).toBe("");
        expect(result.current.submitState.isSubmitting).toBe(false);
    });

    it("should expose derived form helpers", () => {
        const { result } = setupHook({
            initialValues: createValidValues({
                mode: EVENT_MODES.ONLINE,
                registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.CUSTOM
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

    it("should clear selected location when switching to online mode", () => {
        const { result } = setupHook({
            initialValues: createValidValues({
                mode: EVENT_MODES.IN_PERSON,
                location: "Montreal",
                selectedLocation: {
                    label: "Montréal, Québec, Canada",
                    latitude: 45.5017,
                    longitude: -73.5673,
                    provider: "nominatim"
                }
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

        expect(result.current.formState.values.selectedLocation).toBeNull();
    });

    it("should clear selected location when location text changes", () => {
        const { result } = setupHook({
            initialValues: createValidValues({
                location: "Montréal, Québec, Canada",
                selectedLocation: {
                    label: "Montréal, Québec, Canada",
                    latitude: 45.5017,
                    longitude: -73.5673,
                    provider: "nominatim"
                }
            })
        });

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    name: "location",
                    value: "Montréal Museum"
                })
            );
        });

        expect(result.current.formState.values.location).toBe("Montréal Museum");
        expect(result.current.formState.values.selectedLocation).toBeNull();
    });

    it("should clear structured location fields when location text changes", () => {
        const { result } = setupHook({
            initialValues: createValidValues({
                location: "Central Park",
                locationLabel: "Central Park, New York, USA",
                streetAddress: "Central Park",
                city: "New York",
                region: "New York",
                postalCode: "10022",
                country: "USA",
                latitude: 40.785091,
                longitude: -73.968285,
                selectedLocation: {
                    label: "Central Park, New York, USA",
                    latitude: 40.785091,
                    longitude: -73.968285,
                    provider: "nominatim"
                }
            })
        });

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    name: "location",
                    value: "New manual value"
                })
            );
        });

        expect(result.current.formState.values).toMatchObject({
            location: "New manual value",
            locationLabel: "",
            streetAddress: "",
            city: "",
            region: "",
            postalCode: "",
            country: "",
            latitude: null,
            longitude: null,
            selectedLocation: null
        });
    });

    it("should clear custom registration deadline when switching to no deadline", () => {
        const { result } = setupHook({
            initialValues: createValidValues({
                registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.CUSTOM,
                registrationDeadlineCustom: "2026-12-19T10:00"
            })
        });

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    name: "registrationDeadlineOption",
                    value: EVENT_REGISTRATION_DEADLINES.NONE
                })
            );
        });

        expect(result.current.formState.values.registrationDeadlineOption).toBe(EVENT_REGISTRATION_DEADLINES.NONE);

        expect(result.current.formState.values.registrationDeadlineCustom).toBe("");
    });

    it("should clear custom registration deadline when switching to automatic deadline", () => {
        const { result } = setupHook({
            initialValues: createValidValues({
                registrationDeadlineOption: EVENT_REGISTRATION_DEADLINES.CUSTOM,
                registrationDeadlineCustom: "2026-12-19T10:00"
            })
        });

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    name: "registrationDeadlineOption",
                    value: EVENT_REGISTRATION_DEADLINES.DAY_BEFORE
                })
            );
        });

        expect(result.current.formState.values.registrationDeadlineOption).toBe(EVENT_REGISTRATION_DEADLINES.DAY_BEFORE);

        expect(result.current.formState.values.registrationDeadlineCustom).toBe("");
    });

    /* =============================
       LOCATION SELECTION
    ============================= */

    it("should store formatted inline location when autocomplete suggestion is selected", () => {
        const { result } = setupHook();

        const selectedLocation = {
            label: "Central Park, New York, USA",
            streetAddress: "Central Park",
            city: "New York",
            region: "New York",
            postalCode: "10022",
            country: "USA",
            latitude: 40.785091,
            longitude: -73.968285,
            provider: "nominatim"
        };

        act(() => {
            result.current.formActions.handleLocationSelect(selectedLocation);
        });

        expect(result.current.formState.values).toMatchObject({
            location: "Central Park, New York, USA",
            locationLabel: "Central Park, New York, USA",
            streetAddress: "Central Park",
            city: "New York",
            region: "New York",
            postalCode: "10022",
            country: "USA",
            latitude: 40.785091,
            longitude: -73.968285,
            selectedLocation
        });

        expect(result.current.formState.values.selectedLocation).toBe(selectedLocation);

        expect(result.current.formState.values.location).toBe("Central Park, New York, USA");
    });

    it("should clear location error when autocomplete suggestion is selected", () => {
        const { result } = setupHook();

        act(() => {
            result.current.formState.setFieldErrors({
                location: "Location is required"
            });
        });

        act(() => {
            result.current.formActions.handleLocationSelect({
                label: "Central Park, Manhattan, New York, USA",
                latitude: 40.785091,
                longitude: -73.968285,
                provider: "nominatim"
            });
        });

        expect(result.current.formState.fieldErrors.location).toBeUndefined();
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

    it("should clear error before submitting again", async () => {
        const onSubmitValid = vi.fn();

        const { result } = setupHook({
            initialValues: createValidValues(),
            onSubmitValid
        });

        act(() => {
            result.current.feedback.setError("Previous error");
        });

        await act(async () => {
            await result.current.formActions.handleSubmit(createSubmitEvent());
        });

        expect(result.current.feedback.error).toBe("");
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
        expect(result.current.feedback.error).toBe("");
        expect(result.current.submitState.isSubmitting).toBe(false);
    });

    it("should pass configurable validation options to event validation", async () => {
        const onSubmitValid = vi.fn();

        const { result } = setupHook({
            initialValues: createValidValues({
                startDateTime: "2026-05-19T10:00",
                endDateTime: "2026-05-21T12:00"
            }),
            onSubmitValid,
            validationOptions: {
                allowPastStartDateTime: true
            }
        });

        await act(async () => {
            await result.current.formActions.handleSubmit(createSubmitEvent());
        });

        expect(onSubmitValid).toHaveBeenCalledTimes(1);
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

    it("should set error when submit fails", async () => {
        const onSubmitValid = vi.fn().mockRejectedValue({});

        const { result } = setupHook({
            initialValues: createValidValues(),
            onSubmitValid,
            submitErrorMessage: "Failed to create event"
        });

        await act(async () => {
            await result.current.formActions.handleSubmit(createSubmitEvent());
        });

        expect(result.current.feedback.error).toBe("Failed to create event");
        expect(result.current.submitState.isSubmitting).toBe(false);
    });
});
