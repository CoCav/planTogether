/* ==================================================
   INPUT COMPONENT
   Reusable input field for forms
   Supports all native input attributes
================================================== */
export default function Input({ className = "", ...props }) {

    /* =========================
       Render input field
       - Applies base input styles
       - Merges optional custom classes
       - Forwards all native attributes
    ========================= */
    return <input className={`input ${className}`.trim()}{...props}/>
}