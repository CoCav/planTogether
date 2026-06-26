import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import useLoginForm from "../../../../features/auth/hooks/useLoginForm";

import { validateLoginForm } from "../../../../features/auth/authValidation.js";

/* ==================================================
   USE LOGIN FORM TESTS
   Tests login form state and interactions

   Handles:
   - form state initialization
   - field updates
   - remember me state
   - password visibility state
   - validation flow
   - successful submit flow
   - failed submit flow
   - validation error handling
   - API fallback error handling
================================================== */

vi.mock("../../../../features/auth/authValidation.js", () => ({
    validateLoginForm: vi.fn()
}));

describe("useLoginForm", () => {

    /* =============================
       TEST DATA
    ============================= */

    const initialValues = {
        email: "",
        password: ""
    };

    const submitErrorMessage =
        "Unable to login. Please check your credentials.";

    /* =============================
       TEST HELPERS
    ============================= */

    const createHook = (options = {}) => {
        return renderHook(() =>
            useLoginForm({
                initialValues,
                onSubmitValid: options.onSubmitValid || vi.fn(),
                submitErrorMessage: options.submitErrorMessage || submitErrorMessage
            })
        );
    };

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        validateLoginForm.mockReturnValue({});
    });

    /* =============================
       INITIAL STATE
    ============================= */

    it("initializes login form state", () => {
        const { result } = createHook();

        expect(result.current.formState.values).toEqual(initialValues);
        expect(result.current.formState.fieldErrors).toEqual({});

        expect(result.current.feedback.error).toBe("");

        expect(result.current.submitState.isSubmitting).toBe(false);

        expect(result.current.passwordState.showPassword).toBe(false);

        expect(result.current.rememberMeState.rememberMe).toBe(false);
    });

    /* =============================
       FIELD HANDLERS
    ============================= */

    it("updates form field values", () => {
        const { result } = createHook();

        act(() => {
            result.current.formActions.handleFieldChange({
                target: {
                    name: "email",
                    value: "john@example.com"
                }
            });
        });

        expect(result.current.formState.values.email).toBe("john@example.com");
    });

    it("clears field error while editing a field", () => {
        const { result } = createHook();

        act(() => {
            result.current.formState.setFieldErrors({
                email: "Email is required"
            });
        });

        act(() => {
            result.current.formActions.handleFieldChange({
                target: {
                    name: "email",
                    value: "john@example.com"
                }
            });
        });

        expect(result.current.formState.fieldErrors.email).toBeUndefined();
    });

    /* =============================
       REMEMBER ME
    ============================= */

    it("updates remember me state", () => {
        const { result } = createHook();

        act(() => {
            result.current.formActions.handleRememberMeChange({
                target: {
                    checked: true
                }
            });
        });

        expect(result.current.rememberMeState.rememberMe).toBe(true);
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
        validateLoginForm.mockReturnValue({
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
        validateLoginForm.mockReturnValue({
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

    it("submits valid login form values with remember me preference", async () => {
        const onSubmitValid = vi.fn();

        const { result } = createHook({
            onSubmitValid
        });

        act(() => {
            result.current.formActions.handleRememberMeChange({
                target: {
                    checked: true
                }
            });
        });

        await act(async () => {
            await result.current.formActions.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(onSubmitValid).toHaveBeenCalledWith(initialValues, true);
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
