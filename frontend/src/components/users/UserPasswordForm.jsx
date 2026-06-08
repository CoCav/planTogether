import { LockKeyhole } from "lucide-react";

import PasswordField from "./PasswordField";
import PasswordRequirements from "./PasswordRequirements";

import Button from "../ui/Button";

/* ==================================================
   USER PASSWORD FORM
   Displays password update form for authenticated users

   Handles:
   - current password field rendering
   - new password field rendering
   - confirm password field rendering
   - password requirements display
   - password visibility toggles
   - password update submission
   - decorative submit icon
================================================== */

export default function UserPasswordForm({
    values = {},
    fieldErrors = {},

    submitLabel = "Update Password",
    isSubmitting,

    showPasswords = {},

    onFieldChange,
    onSubmit,
    onTogglePassword
}) {

    /* =============================
       MAIN RENDER
    ============================= */

    return (
        <form onSubmit={onSubmit} className="form-layout">
            <div className="form-grid">

                <div className="form-grid-column-full">
                    <PasswordField
                        id="currentPassword"
                        label="Current password"
                        name="currentPassword"
                        value={values.currentPassword || ""}
                        placeholder="Enter your current password"

                        error={fieldErrors.currentPassword}

                        visible={!!showPasswords.currentPassword}
                        autoComplete="current-password"

                        onChange={onFieldChange}
                        onToggle={() => onTogglePassword("currentPassword")}
                    />
                </div>

                <div className="form-grid-column-full">
                    <PasswordField
                        id="newPassword"
                        label="New password"
                        name="newPassword"
                        value={values.newPassword || ""}
                        placeholder="Enter your new password"

                        error={fieldErrors.newPassword}

                        visible={!!showPasswords.newPassword}
                        autoComplete="new-password"

                        onChange={onFieldChange}
                        onToggle={() => onTogglePassword("newPassword")}
                    >
                        <PasswordRequirements
                            id="newPassword-requirements"
                            password={values.newPassword}
                        />
                    </PasswordField>
                </div>

                <div className="form-grid-column-full">
                    <PasswordField
                        id="confirmPassword"
                        label="Confirm new password"
                        name="confirmPassword"
                        value={values.confirmPassword || ""}
                        placeholder="Confirm your new password"

                        error={fieldErrors.confirmPassword}

                        visible={!!showPasswords.confirmPassword}
                        autoComplete="new-password"

                        onChange={onFieldChange}
                        onToggle={() => onTogglePassword("confirmPassword")}
                    />
                </div>

            </div>

            <div className="form-actions">
                <Button type="submit" loading={isSubmitting}>
                    <LockKeyhole aria-hidden="true" />
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}
