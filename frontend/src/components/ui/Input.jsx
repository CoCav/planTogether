
export default function Input({
    type = "text",
    value = "",
    className = "",
    ...props
}) {
    return (
        <input type={type} value={value} className={`input ${className}`} {...props}/>
    );
}