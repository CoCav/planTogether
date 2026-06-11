import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useMyPasswordForm from "../../../../../../features/users/authenticated/hooks/form/useMyPasswordForm";

import { changeCurrentUserPassword } from "../../../../../../api/users/userApi";

/* ==================================================
   USE MY PASSWORD FORM TESTS
   Tests authenticated user password update form state

   Handles:
   - initial form state
   - field changes
   - field error clearing
   - password visibility toggles
   - validation errors
   - successful password update
   - password form reset after success
   - API field error mapping
   - generic submit error handling
================================================== */

/* =============================
   MOCKS
============================= */

vi.mock("../../../../../../api/users/userApi", () => ({
    changeCurrentUserPassword: vi.fn()
}));

describe("useMyPasswordForm", () => {

    /* =============================
       TEST DATA
    ============================= */

    let setMessage;
    let setError;

    /* =============================
       TEST HELPERS
    ============================= */

    const createChangeEvent = ({ name, value }) => ({
        target: {
            name,
            value
        }
    });

    const createSubmitEvent = () => ({
        preventDefault: vi.fn()
    });

    const setupHook = () => {
        return renderHook(() =>
            useMyPasswordForm({
                setMessage,
                setError
            })
        );
    };

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        setMessage = vi.fn();
        setError = vi.fn();
    });

    /* =============================
       INITIAL STATE
    ============================= */

    it("should initialize password form state", () => {
        const { result } = setupHook();

        expect(result.current.formState.values).toEqual({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });

        expect(result.current.formState.fieldErrors).toEqual({});

        expect(result.current.submitState.isSubmitting).toBe(false);

        expect(result.current.passwordState.showPasswords).toEqual({
            currentPassword: false,
            newPassword: false,
            confirmPassword: false
        });
    });

    /* =============================
       FIELD CHANGES
    ============================= */

    it("should update password field value", () => {
        const { result } = setupHook();

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    name: "currentPassword",
                    value: "OldPassword123"
                })
            );
        });

        expect(result.current.formState.values.currentPassword).toBe("OldPassword123");
    });

    it("should clear field error when field changes", () => {
        const { result } = setupHook();

        act(() => {
            result.current.formState.setFieldErrors({
                currentPassword: "Current password is required"
            });
        });

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    name: "currentPassword",
                    value: "OldPassword123"
                })
            );
        });

        expect(result.current.formState.fieldErrors.currentPassword).toBeUndefined();
    });

    /* =============================
       PASSWORD VISIBILITY
    ============================= */

    it("should toggle password visibility by field", () => {
        const { result } = setupHook();

        act(() => {
            result.current.formActions.handleTogglePassword("newPassword");
        });

        expect(result.current.passwordState.showPasswords.newPassword).toBe(true);
    });

    /* =============================
       SUBMIT
    ============================= */

    it("should clear page feedback before submitting", async () => {
        const { result } = setupHook();

        await act(async () => {
            await result.current.formActions.handleSubmit(
                createSubmitEvent()
            );
        });

        expect(setMessage).toHaveBeenCalledWith("");
        expect(setError).toHaveBeenCalledWith("");
    });

    it("should set validation errors when password form is invalid", async () => {
        const { result } = setupHook();

        await act(async () => {
            await result.current.formActions.handleSubmit(
                createSubmitEvent()
            );
        });

        expect(changeCurrentUserPassword).not.toHaveBeenCalled();

        expect(result.current.formState.fieldErrors).toMatchObject({
            currentPassword: "Current password is required",
            newPassword: "New password is required",
            confirmPassword: "Confirm password is required"
        });
    });

    it("should submit valid password form and reset values", async () => {
        changeCurrentUserPassword.mockResolvedValue({});

        const { result } = setupHook();

        act(() => {
            result.current.formState.setValues({
                currentPassword: "OldPassword123",
                newPassword: "NewPassword123",
                confirmPassword: "NewPassword123"
            });
        });

        const submitEvent = createSubmitEvent();

        await act(async () => {
            await result.current.formActions.handleSubmit(submitEvent);
        });

        expect(submitEvent.preventDefault).toHaveBeenCalledTimes(1);

        expect(changeCurrentUserPassword).toHaveBeenCalledWith({
            currentPassword: "OldPassword123",
            newPassword: "NewPassword123"
        });

        expect(setMessage).toHaveBeenCalledWith("Password updated successfully");

        expect(result.current.formState.values).toEqual({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        });

        expect(result.current.passwordState.showPasswords).toEqual({
            currentPassword: false,
            newPassword: false,
            confirmPassword: false
        });

        expect(result.current.submitState.isSubmitting).toBe(false);
    });

    it("should clear field errors after successful submit", async () => {
        changeCurrentUserPassword.mockResolvedValue({});

        const { result } = setupHook();

        act(() => {
            result.current.formState.setFieldErrors({
                newPassword: "Previous error"
            });

            result.current.formState.setValues({
                currentPassword: "OldPassword123",
                newPassword: "NewPassword123",
                confirmPassword: "NewPassword123"
            });
        });

        await act(async () => {
            await result.current.formActions.handleSubmit(
                createSubmitEvent()
            );
        });

        expect(result.current.formState.fieldErrors).toEqual({});
    });

    /* =============================
       ERROR HANDLING
    ============================= */

    it("should map invalid current password API error to current password field", async () => {
        changeCurrentUserPassword.mockRejectedValue({
            response: {
                status: 401,
                data: {
                    message: "Current password is incorrect"
                }
            }
        });

        const { result } = setupHook();

        act(() => {
            result.current.formState.setValues({
                currentPassword: "WrongPassword123",
                newPassword: "NewPassword123",
                confirmPassword: "NewPassword123"
            });
        });

        await act(async () => {
            await result.current.formActions.handleSubmit(
                createSubmitEvent()
            );
        });

        expect(result.current.formState.fieldErrors.currentPassword).toBe("Current password is incorrect");
    });

    it("should map backend new password error to new password field", async () => {
        changeCurrentUserPassword.mockRejectedValue({
            response: {
                status: 400,
                data: {
                    message: "New password must be different from current password"
                }
            }
        });

        const { result } = setupHook();

        act(() => {
            result.current.formState.setValues({
                currentPassword: "Password123",
                newPassword: "Password123",
                confirmPassword: "Password123"
            });
        });

        await act(async () => {
            await result.current.formActions.handleSubmit(
                createSubmitEvent()
            );
        });

        expect(result.current.formState.fieldErrors.newPassword).toEqual([
            "New password must be different from current password"
        ]);
    });

    it("should set page error when password update fails", async () => {
        changeCurrentUserPassword.mockRejectedValue(
            new Error("Network error")
        );

        const { result } = setupHook();

        act(() => {
            result.current.formState.setValues({
                currentPassword: "OldPassword123",
                newPassword: "NewPassword123",
                confirmPassword: "NewPassword123"
            });
        });

        await act(async () => {
            await result.current.formActions.handleSubmit(
                createSubmitEvent()
            );
        });

        expect(setError).toHaveBeenLastCalledWith("Network error");

        expect(result.current.submitState.isSubmitting).toBe(false);
    });
});
