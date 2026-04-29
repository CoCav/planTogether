import Button from "../ui/Button";
import FormField from "../ui/FormField";
import Input from "../ui/Input";

/* ==================================================
   USER PROFILE FORM
   Displays the profile update form

   Handles:
   - name input
   - email input
   - validation error display
================================================== */

export default function ProfileInfoForm({ form, errors, submitting, onChange, onSubmit }) {
    return (
        <form onSubmit={onSubmit} className="event-form">
            <div className="form-grid">
                <FormField label="Name" error={errors.name}>
                    <Input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={onChange}
                        placeholder="Your name"
                        error={errors.name}
                    />
                </FormField>

                <FormField label="Email" error={errors.email}>
                    <Input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        placeholder="Your email"
                        error={errors.email}
                    />
                </FormField>
            </div>

            <div className="form-actions">
                <Button type="submit" loading={submitting}>Update Profile</Button>
            </div>
        </form>
    );
}