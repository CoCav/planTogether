import AuthPasswordField from "./AuthPasswordField";
import PasswordRequirements from "./PasswordRequirements";
import Button from "../ui/Button";

/* ==================================================
   CHANGE PASSWORD FORM
   Displays the password update form

   Handles:
   - current password input
   - new password input
   - confirm password input
   - password requirements display
================================================== */

export default function ChangePasswordForm({ form, errors, showPasswords, submitting, onChange, onSubmit, onTogglePassword }) {
    return (
        <form onSubmit={onSubmit} className="event-form">
            <div className="password-fields">

                <AuthPasswordField
                    label="Current password"
                    name="currentPassword"
                    value={form.currentPassword}
                    placeholder="Current password"
                    error={errors.currentPassword}
                    visible={showPasswords.currentPassword}
                    onChange={onChange}
                    onToggle={() => onTogglePassword("currentPassword")}
                />

                <AuthPasswordField
                    label="New password"
                    name="newPassword"
                    value={form.newPassword}
                    placeholder="New password"
                    error={errors.newPassword}
                    visible={showPasswords.newPassword}
                    onChange={onChange}
                    onToggle={() => onTogglePassword("newPassword")}
                >
                    <PasswordRequirements password={form.newPassword} />
                </AuthPasswordField>

                <AuthPasswordField
                    label="Confirm new password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    placeholder="Confirm new password"
                    error={errors.confirmPassword}
                    visible={showPasswords.confirmPassword}
                    onChange={onChange}
                    onToggle={() => onTogglePassword("confirmPassword")}
                />

            </div>

            <div className="form-actions">
                <Button type="submit" loading={submitting}>
                    Update Password
                </Button>
            </div>
        </form>
    );
}