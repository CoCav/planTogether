import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { getApiErrorMessage } from "../../../../api/apiError";
import { deleteCurrentUserAccount } from "../../../../api/users/userApi";

/* ==================================================
   USE DELETE ACCOUNT
   Handles authenticated account deletion flow

   Handles:
   - delete account confirmation
   - account deletion API request
   - session cleanup after deletion
   - post-deletion redirect
   - backend error feedback

   Notes:
   - uses toast feedback for temporary action errors
   - window.confirm is kept for delete confirmation
================================================== */

export default function useDeleteAccount({ logout, toast }) {
    const navigate = useNavigate();

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete your account? This action cannot be undone."
        );

        if (!confirmed) return;

        try {
            setIsDeleting(true);

            await deleteCurrentUserAccount();

            await logout();

            navigate("/");
        } catch (error) {
            toast.danger(getApiErrorMessage(error, "Unable to delete account"));
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        isDeleting,
        handleDeleteAccount
    };
}
