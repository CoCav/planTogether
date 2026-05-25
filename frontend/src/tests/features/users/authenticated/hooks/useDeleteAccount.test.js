import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useDeleteAccount from "../../../../../features/users/authenticated/hooks/useDeleteAccount";

import { deleteCurrentUserAccount } from "../../../../../api/users/userApi";

/* ==================================================
   USE DELETE ACCOUNT TESTS
   Tests authenticated account deletion flow

   Handles:
   - delete account confirmation
   - cancelled deletion flow
   - account deletion API request
   - session cleanup after deletion
   - post-deletion redirect
   - backend error feedback
   - delete loading state
================================================== */

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate
}));

vi.mock("../../../../../api/users/userApi", () => ({
    deleteCurrentUserAccount: vi.fn()
}));

vi.mock("../../../../../api/apiError", () => ({
    getApiErrorMessage: (error, fallback) => error?.message || fallback
}));

describe("useDeleteAccount", () => {
    let hookProps;

    beforeEach(() => {
        vi.clearAllMocks();

        hookProps = {
            logout: vi.fn(),
            setMessage: vi.fn(),
            setError: vi.fn()
        };

        vi.spyOn(window, "confirm").mockReturnValue(true);
    });

    /* =============================
       TEST HELPERS
    ============================= */

    const setupHook = () => {
        return renderHook(() =>
            useDeleteAccount({
                logout: hookProps.logout,
                setMessage: hookProps.setMessage,
                setError: hookProps.setError
            })
        );
    };

    /* =============================
       INITIAL STATE
    ============================= */

    it("should initialize with inactive deleting state", () => {
        const { result } = setupHook();

        expect(result.current.isDeleting).toBe(false);
    });

    /* =============================
       CONFIRMATION
    ============================= */

    it("should stop account deletion when confirmation is cancelled", async () => {
        vi.spyOn(window, "confirm").mockReturnValue(false);

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleDeleteAccount();
        });

        expect(deleteCurrentUserAccount).not.toHaveBeenCalled();
        expect(hookProps.logout).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    /* =============================
       SUCCESSFUL DELETION
    ============================= */

    it("should delete account, logout, and redirect home", async () => {
        deleteCurrentUserAccount.mockResolvedValue({});

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleDeleteAccount();
        });

        expect(window.confirm).toHaveBeenCalledWith(
            "Are you sure you want to delete your account? This action cannot be undone."
        );

        expect(hookProps.setMessage).toHaveBeenCalledWith("");
        expect(hookProps.setError).toHaveBeenCalledWith("");

        expect(deleteCurrentUserAccount).toHaveBeenCalledTimes(1);
        expect(hookProps.logout).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("should expose deleting state while account deletion is pending", async () => {
        let resolveDeletion;

        deleteCurrentUserAccount.mockImplementation(() =>
            new Promise((resolve) => {
                resolveDeletion = resolve;
            })
        );

        const { result } = setupHook();

        let deletionPromise;

        await act(async () => {
            deletionPromise = result.current.handleDeleteAccount();
        });

        expect(result.current.isDeleting).toBe(true);

        await act(async () => {
            resolveDeletion({});
            await deletionPromise;
        });

        expect(result.current.isDeleting).toBe(false);
    });

    /* =============================
       FAILED DELETION
    ============================= */

    it("should show error when account deletion fails", async () => {
        deleteCurrentUserAccount.mockRejectedValue(new Error("Delete failed"));

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleDeleteAccount();
        });

        expect(hookProps.setError).toHaveBeenCalledWith("Delete failed");
        expect(hookProps.logout).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalledWith("/");
    });

    it("should reset deleting state when account deletion fails", async () => {
        deleteCurrentUserAccount.mockRejectedValue(new Error("Delete failed"));

        const { result } = setupHook();

        await act(async () => {
            await result.current.handleDeleteAccount();
        });

        expect(result.current.isDeleting).toBe(false);
    });
});
