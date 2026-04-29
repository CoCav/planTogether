/* ==================================================
   LOADING STATE
   Displays a loading message while content is being fetched

   Supports:
   - default loading text
   - custom loading message
================================================== */

export default function LoadingState({ children = "Loading..." }) {
    return (
        <div className="loading-state">{children}</div>
    );
}