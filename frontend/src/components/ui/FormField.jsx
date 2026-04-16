
export default function FormField({ label, children }) {
  return (
        <div className="form-field">
            <label className="form-label">{label}</label>
            {children}
        </div>
    );
}