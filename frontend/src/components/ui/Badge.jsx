
export default function Badge({ role, className = "" }) {
    if (!role) return null;

    let label = "";
    let variant = "";

    switch (role) {
        case "organizer":
            label = "👑 Organizer";
            variant = "organizer";
        break;
        case "co_organizer":
            label = "🛡️ Co-organizer";
            variant = "co";
        break;
        default:
            label = "👤 Participant";
            variant = "participant";
    }

    return (<span className={`badge badge-${variant} ${className}`.trim()}>{label}</span>);
};