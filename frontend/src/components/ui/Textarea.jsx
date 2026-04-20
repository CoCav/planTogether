/* ==================================================
   TEXTAREA COMPONENT
   Reusable textarea field for longer text input
================================================== */
export default function Textarea({ className = "", rows = 4, ...props }) {

    /* =========================
       Render textarea
       - Applies base textarea styles
       - Uses a default row count
       - Forwards all native textarea attributes
    ========================= */
    return <textarea className={`textarea ${className}`.trim()} rows={rows} {...props}/>
}