import Button from "../ui/Button";
import FormField from "../ui/FormField";
import Input from "../ui/Input";

/* ==================================================
   AUTH PASSWORD FIELD
   Reusable password input with visibility toggle

   Handles:
   - password input rendering
   - show / hide toggle
   - validation error display
================================================== */

export default function AuthPasswordField({ label, name, value, placeholder, error, visible, onChange, onToggle, children }) {
    return (
        <FormField label={label} error={!Array.isArray(error) ? error : undefined}>
            <div className="password-row">
                <Input
                    type={visible ? "text" : "password"}
                    name={name}
                    value={value}
                    placeholder={placeholder}
                    onChange={onChange}
                    error={!!error}
                />

                <Button type="button" variant="outline" onClick={onToggle}>{visible ? "Hide" : "Show"}</Button>
            </div>

            {Array.isArray(error) && (
                <ul className="field-error-list">
                    {error.map((item) => (
                        <li key={item} className="field-error">{item}</li>
                    ))}
                </ul>
            )}

            {children}
        </FormField>
    );
}