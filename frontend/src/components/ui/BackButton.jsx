import { useNavigate } from "react-router-dom";

export default function BackButton({
    fallbackPath = "/",
    label = "← Back",
    style = { marginTop: "10px", marginLeft: "10px", marginBottom: "10px"}}) {

        const navigate = useNavigate();

        const handleClick = () => {
            
            if (window.history.length > 1) {
                navigate(-1);
            } else {
                navigate(fallbackPath);
            }  
    };

return (
    <button onClick={handleClick} style={style}>
        {label}
    </button>
)};
