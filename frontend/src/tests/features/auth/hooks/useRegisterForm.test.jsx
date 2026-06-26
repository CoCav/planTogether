import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import useRegisterForm from "../../../../features/auth/hooks/useRegisterForm";
import { validateRegisterForm } from "../../../../features/auth/authValidation.js";

/* ==================================================
   USE REGISTER FORM TESTS
   Tests register form state, interactions and submit flows

   Handles:
   - form state initialization
   - field updates and error clearing
   - avatar updates and removal
   - avatar error clearing
   - password visibility state
   - validation flow
   - successful submit flow
   - submit loading state
   - failed submit flow
   - custom submit error handling
================================================== */

vi.mock("../../../../features/auth/authValidation", () => ({
    validateRegisterForm: vi.fn()
}));

describe("useRegisterForm", () => {

    /* =============================
       TEST DATA
    ============================= */

    const initialValues = {
        name: "",
        email: "",
        password: "",
        avatar: null
    };

    const submitErrorMessage = "Unable to register. Please check your information.";

    /* =============================
       TEST HELPERS
    ============================= */

    const createHook = (options = {}) => {
        return renderHook(() =>
            useRegisterForm({
                initialValues,
                onSubmitValid: options.onSubmitValid || vi.fn(),
                submitErrorMessage:
                    options.submitErrorMessage || submitErrorMessage
            })
        );
    };

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        validateRegisterForm.mockReturnValue({});
    });

    /* =============================
       INITIAL STATE
    ============================= */

    it("initializes register form state", () => {
        const { result } = createHook();

        expect(result.current.formState.values).toEqual(initialValues);
        expect(result.current.formState.fieldErrors).toEqual({});

        expect(result.current.feedback.error).toBe("");

        expect(result.current.submitState.isSubmitting).toBe(false);

        expect(result.current.passwordState.showPassword).toBe(false);
    });

    /* =============================
       FIELD HANDLERS
    ============================= */

    it("updates form field values", () => {
        const { result } = createHook();

        act(() => {
            result.current.formActions.handleFieldChange({
                target: {
                    name: "name",
                    value: "John"
                }
            });
        });

        expect(result.current.formState.values.name).toBe("John");
    });

    it("clears field error while editing a field", () => {
        const { result } = createHook();

        act(() => {
            result.current.formState.setFieldErrors({
                name: "Name is required"
            });
        });

        act(() => {
            result.current.formActions.handleFieldChange({
                target: {
                    name: "name",
                    value: "John"
                }
            });
        });

        expect(result.current.formState.fieldErrors.name).toBeUndefined();
    });

    /* =============================
       AVATAR HANDLERS
    ============================= */

    it("updates avatar value", () => {
        const { result } = createHook();

        const file = new File(["avatar"], "avatar.png", {
            type: "image/png"
        });

        act(() => {
            result.current.formActions.handleAvatarChange({
                target: {
                    files: [file]
                }
            });
        });

        expect(result.current.formState.values.avatar).toBe(file);
    });

    it("clears avatar error after selecting a file", () => {
        const { result } = createHook();

        const file = new File(["avatar"], "avatar.png", {
            type: "image/png"
        });

        act(() => {
            result.current.formState.setFieldErrors({
                avatar: "Avatar is invalid"
            });
        });

        act(() => {
            result.current.formActions.handleAvatarChange({
                target: {
                    files: [file]
                }
            });
        });

        expect(result.current.formState.fieldErrors.avatar).toBeUndefined();
    });

    it("removes avatar value", () => {
        const { result } = createHook();

        const file = new File(["avatar"], "avatar.png", {
            type: "image/png"
        });

        act(() => {
            result.current.formState.setValues((current) => ({
                ...current,
                avatar: file
            }));
        });

        act(() => {
            result.current.formActions.handleRemoveAvatar();
        });

        expect(result.current.formState.values.avatar).toBeNull();
    });

    it("clears avatar error after removing the avatar", () => {
        const { result } = createHook();

        act(() => {
            result.current.formState.setFieldErrors({
                avatar: "Avatar is invalid"
            });
        });

        act(() => {
            result.current.formActions.handleRemoveAvatar();
        });

        expect(result.current.formState.fieldErrors.avatar).toBeUndefined();
    });

    /* =============================
       PASSWORD VISIBILITY
    ============================= */

    it("toggles password visibility state", () => {
        const { result } = createHook();

        act(() => {
            result.current.formActions.handleTogglePassword();
        });

        expect(result.current.passwordState.showPassword).toBe(true);

        act(() => {
            result.current.formActions.handleTogglePassword();
        });

        expect(result.current.passwordState.showPassword).toBe(false);
    });

    /* =============================
       VALIDATION
    ============================= */

    it("stores validation errors when form is invalid", async () => {
        validateRegisterForm.mockReturnValue({
            email: "Email is required"
        });

        const onSubmitValid = vi.fn();

        const { result } = createHook({
            onSubmitValid
        });

        await act(async () => {
            await result.current.formActions.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(result.current.formState.fieldErrors).toEqual({
            email: "Email is required"
        });

        expect(onSubmitValid).not.toHaveBeenCalled();
    });

    it("prevents submit loading state when validation fails", async () => {
        validateRegisterForm.mockReturnValue({
            email: "Email is required"
        });

        const { result } = createHook();

        await act(async () => {
            await result.current.formActions.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(result.current.submitState.isSubmitting).toBe(false);
    });

    /* =============================
       SUBMISSION
    ============================= */

    it("submits valid register form values", async () => {
        const onSubmitValid = vi.fn();

        const { result } = createHook({
            onSubmitValid
        });

        await act(async () => {
            await result.current.formActions.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(onSubmitValid).toHaveBeenCalledWith(initialValues);
    });

    it("sets submit loading state during submission", async () => {
        let resolveSubmit;

        const onSubmitValid = vi.fn(() => {
            return new Promise((resolve) => {
                resolveSubmit = resolve;
            });
        });

        const { result } = createHook({
            onSubmitValid
        });

        act(() => {
            result.current.formActions.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(result.current.submitState.isSubmitting).toBe(true);

        await act(async () => {
            resolveSubmit();
        });

        expect(result.current.submitState.isSubmitting).toBe(false);
    });

    it("stores submit error when submission fails", async () => {
        const onSubmitValid = vi.fn(() => {
            throw {};
        });

        const { result } = createHook({
            onSubmitValid
        });

        await act(async () => {
            await result.current.formActions.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(result.current.feedback.error).toBe(submitErrorMessage);
    });

    it("uses custom submit error message when submission fails", async () => {
        const customSubmitErrorMessage = "Custom register error";

        const onSubmitValid = vi.fn(() => {
            throw {};
        });

        const { result } = createHook({
            onSubmitValid,
            submitErrorMessage: customSubmitErrorMessage
        });

        await act(async () => {
            await result.current.formActions.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(result.current.feedback.error).toBe(
            customSubmitErrorMessage
        );
    });

    it("clears page-level error before submitting again", async () => {
        const { result } = createHook();

        act(() => {
            result.current.feedback.setError("Previous error");
        });

        await act(async () => {
            await result.current.formActions.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(result.current.feedback.error).toBe("");
    });
});
