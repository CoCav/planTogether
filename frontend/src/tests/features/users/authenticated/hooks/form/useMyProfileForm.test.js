import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useMyProfileForm from "../../../../../../features/users/authenticated/hooks/form/useMyProfileForm";

import { updateCurrentUserProfile } from "../../../../../../api/users/userApi";

import { buildCurrentUserProfileFormData } from "../../../../../../features/users/authenticated/myProfilePayloadBuilder";

/* ==================================================
   USE MY PROFILE FORM TESTS
   Tests authenticated user profile form state

   Handles:
   - initial profile state
   - profile sync from user
   - field changes
   - avatar changes
   - avatar removal
   - validation errors
   - successful profile update
   - profile refresh after success
   - generic submit error handling
================================================== */

/* =============================
   MOCKS
============================= */

vi.mock("../../../../../../api/users/userApi", () => ({
    updateCurrentUserProfile: vi.fn()
}));

vi.mock("../../../../../../features/users/authenticated/myProfilePayloadBuilder", () => ({
    buildCurrentUserProfileFormData: vi.fn()
}));

describe("useMyProfileForm", () => {

    /* =============================
       TEST DATA
    ============================= */

    let setMessage;
    let setError;
    let refreshUser;

    const defaultUser = {
        userId: 1,
        name: "John",
        email: "john@example.com",
        avatar: "/uploads/users/avatar.png"
    };

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

    const setupHook = ({
        user = defaultUser
    } = {}) => {
        return renderHook(() =>
            useMyProfileForm({
                user,
                refreshUser,
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

        refreshUser = vi.fn();

        buildCurrentUserProfileFormData.mockReturnValue("profile-form-data");
    });

    /* =============================
       INITIAL STATE
    ============================= */

    it("should initialize profile form state from user", () => {
        const { result } = setupHook();

        expect(result.current.formState.values).toEqual({
            name: "John",
            email: "john@example.com",
            avatar: null,
            currentAvatar: "/uploads/users/avatar.png"
        });

        expect(result.current.formState.fieldErrors).toEqual({});

        expect(result.current.submitState.isSubmitting).toBe(false);
    });

    it("should initialize empty profile form state when user is null", () => {
        const { result } = setupHook({
            user: null
        });

        expect(result.current.formState.values).toEqual({
            name: "",
            email: "",
            avatar: null,
            currentAvatar: null
        });
    });

    it("should sync profile values when user changes", () => {
        const { result, rerender } = renderHook(
            ({ user }) =>
                useMyProfileForm({
                    user,
                    refreshUser,
                    setMessage,
                    setError
                }),
            {
                initialProps: {
                    user: defaultUser
                }
            }
        );

        rerender({
            user: {
                userId: 2,
                name: "Alice",
                email: "alice@example.com",
                avatar: null
            }
        });

        expect(result.current.formState.values).toMatchObject({
            name: "Alice",
            email: "alice@example.com",
            avatar: null,
            currentAvatar: null
        });
    });

    /* =============================
       FIELD CHANGES
    ============================= */

    it("should update profile field value", () => {
        const { result } = setupHook();

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    name: "name",
                    value: "Jane"
                })
            );
        });

        expect(result.current.formState.values.name).toBe("Jane");
    });

    it("should clear field error when profile field changes", () => {
        const { result } = setupHook();

        act(() => {
            result.current.formState.setFieldErrors({
                name: "Name is required"
            });
        });

        act(() => {
            result.current.formActions.handleFieldChange(
                createChangeEvent({
                    name: "name",
                    value: "Jane"
                })
            );
        });

        expect(result.current.formState.fieldErrors.name).toBeUndefined();
    });

    /* =============================
       AVATAR CHANGES
    ============================= */

    it("should update selected avatar file", () => {
        const file = new File(
            ["avatar"],
            "avatar.png",
            {
                type: "image/png"
            }
        );

        const { result } = setupHook();

        act(() => {
            result.current.formActions.handleAvatarChange({
                target: {
                    files: [file]
                }
            });
        });

        expect(result.current.formState.values.avatar).toBe(file);

        expect(result.current.formState.fieldErrors.avatar).toBeUndefined();
    });

    it("should set avatar to null when no avatar file is selected", () => {
        const { result } = setupHook();

        act(() => {
            result.current.formActions.handleAvatarChange({
                target: {
                    files: []
                }
            });
        });

        expect(result.current.formState.values.avatar).toBe(null);
    });

    it("should remove selected and current avatar", () => {
        const { result } = setupHook();

        act(() => {
            result.current.formState.setValues({
                name: "John",
                email: "john@example.com",
                avatar: new File(
                    ["avatar"],
                    "avatar.png",
                    {
                        type: "image/png"
                    }
                ),
                currentAvatar: "/uploads/users/avatar.png"
            });
        });

        act(() => {
            result.current.formActions.handleRemoveAvatar();
        });

        expect(result.current.formState.values.avatar).toBe(null);

        expect(result.current.formState.values.currentAvatar).toBe(null);
    });

    it("should clear avatar error when avatar is removed", () => {
        const { result } = setupHook();

        act(() => {
            result.current.formState.setFieldErrors({
                avatar: "Invalid avatar"
            });
        });

        act(() => {
            result.current.formActions.handleRemoveAvatar();
        });

        expect(result.current.formState.fieldErrors.avatar).toBeUndefined();
    });

    /* =============================
       SUBMIT
    ============================= */

    it("should set validation errors when profile form is invalid", async () => {
        const { result } = setupHook();

        act(() => {
            result.current.formState.setValues({
                name: "",
                email: "invalid-email",
                avatar: null,
                currentAvatar: null
            });
        });

        await act(async () => {
            await result.current.formActions.handleSubmit(
                createSubmitEvent()
            );
        });

        expect(updateCurrentUserProfile).not.toHaveBeenCalled();

        expect(result.current.formState.fieldErrors).toMatchObject({
            name: "Name is required",
            email: "Invalid email"
        });
    });

    it("should submit valid profile form and refresh user", async () => {
        updateCurrentUserProfile.mockResolvedValue({});
        refreshUser.mockResolvedValue({});

        const { result } = setupHook();

        const submitEvent = createSubmitEvent();

        await act(async () => {
            await result.current.formActions.handleSubmit(
                submitEvent
            );
        });

        expect(submitEvent.preventDefault).toHaveBeenCalledTimes(1);

        expect(buildCurrentUserProfileFormData).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "John",
                email: "john@example.com"
            })
        );

        expect(updateCurrentUserProfile).toHaveBeenCalledWith("profile-form-data");

        expect(refreshUser).toHaveBeenCalledTimes(1);

        expect(setMessage).toHaveBeenCalledWith("✅ Profile updated successfully");

        expect(result.current.submitState.isSubmitting).toBe(false);
    });

    /* =============================
       ERROR HANDLING
    ============================= */

    it("should set page error when profile update fails", async () => {
        updateCurrentUserProfile.mockRejectedValue(
            new Error("Network error")
        );

        const { result } = setupHook();

        await act(async () => {
            await result.current.formActions.handleSubmit(
                createSubmitEvent()
            );
        });

        expect(setError).toHaveBeenLastCalledWith("Network error");

        expect(result.current.submitState.isSubmitting).toBe(false);
    });
});
