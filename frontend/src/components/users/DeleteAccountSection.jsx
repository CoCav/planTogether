import Button from "../ui/Button";

/* ==================================================
   DELETE ACCOUNT SECTION
   Displays destructive account deletion action

   Handles:
   - account deletion warning
   - destructive account deletion action
   - disabled delete state while submitting
   - accessible warning association for destructive actions
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
                    Permanently delete your account and remove access to your profile.
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
                    {isDeleting ? "Deleting account..." : "Delete Account"}
                </Button>
            </div>
        </section>
    );
}
