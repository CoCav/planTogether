import { Trash2 } from "lucide-react";

import Button from "../ui/Button";

/* ==================================================
   DELETE ACCOUNT SECTION
   Displays destructive account deletion action

   Handles:
   - account deletion warning
   - destructive account deletion action
   - loading deletion state
   - accessible warning association for destructive actions
   - decorative trash icon
================================================== */

export default function DeleteAccountSection({
    isDeleting,
    onDeleteAccount
}) {
    return (
        <section aria-labelledby="delete-account-title">
            <header className="section-header">
                <h2 id="delete-account-title" className="section-title">
                    Delete Account
                </h2>

                <p className="section-subtitle">
                    Permanently delete your account and associated data.
                </p>
            </header>

            <div className="danger-zone">
                <div className="danger-zone-content">
                    <p id="delete-account-warning">
                        This action cannot be undone. You must transfer ownership of
                        your active or upcoming events before deleting your account.
                    </p>
                </div>

                <Button
                    type="button"
                    variant="danger"
                    disabled={isDeleting}
                    onClick={onDeleteAccount}
                    aria-describedby="delete-account-warning"
                >
                    <Trash2 aria-hidden="true" />
                    {isDeleting ? "Deleting account..." : "Delete Account"}
                </Button>
            </div>
        </section>
    );
}
