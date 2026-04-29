/* ==================================================
   INPUT
   Reusable styled input field for forms

   Handles:
   - base input styling
   - error styling
   - native input attributes
================================================== */

export default function Input({ className = "", error = false, ...props }) {
    return (
        <input
            className={`input ${error ? "error" : ""} ${className}`.trim()}
            {...props}
        />
    );
}