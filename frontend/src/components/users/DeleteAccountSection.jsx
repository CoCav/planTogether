import { useId } from "react";
import { Trash2 } from "lucide-react";

import Button from "../ui/Button";

/* ==================================================
   DELETE ACCOUNT SECTION
   Displays destructive account deletion action

   Handles:
   - account deletion warning display
   - destructive account deletion action
   - loading deletion state
   - accessible section heading association
   - accessible warning association for destructive action
   - decorative trash icon
================================================== */

export default function DeleteAccountSection({
    isDeleting,
    onDeleteAccount
}) {

    /* =============================
       ACCESSIBILITY
    ============================= */

    // Associates the section heading and warning text with the delete action
    const titleId = useId();
    const warningId = useId();

    return (
        <section aria-labelledby={titleId}>
            <header className="section-header">
                <h2 id={titleId} className="section-title">
                    Delete Account
                </h2>

                <p className="section-subtitle">
                    Permanently delete your account and associated data.
                </p>
            </header>

            <div className="danger-zone">
                <div className="danger-zone-content">
                    <p id={warningId}>
                        This action cannot be undone. You must transfer ownership of
                        your active or upcoming events before deleting your account.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="danger"
                    disabled={isDeleting}
                    onClick={onDeleteAccount}
                    aria-describedby={warningId}
                >
                    <Trash2 aria-hidden="true" />
                    {isDeleting ? "Deleting account..." : "Delete Account"}
                </Button>
            </div>
        </section>
    );
}
