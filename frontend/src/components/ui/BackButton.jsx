import { useNavigate } from "react-router-dom";

export default function BackButton({
    label = "← Back",
    fallbackPath = "/",
    useHistory = true,
}) {

    const navigate = useNavigate();

    const handleClick = () => {
        if (useHistory && window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(fallbackPath);
        }
    };

    return (
        <button type="button" className="btn btn-outline" onClick={handleClick}>{label}</button>
    );
}