/* ==================================================
   TEXTAREA
   Reusable styled textarea for longer input

   Handles:
   - base styling
   - error state
   - default rows
================================================== */

export default function TextArea({ className = "", error = false, rows = 4, ...props }) {
    return (
        <textarea
            className={`textarea ${error ? "error" : ""} ${className}`.trim()}
            rows={rows}
            {...props}
        />
    );
}