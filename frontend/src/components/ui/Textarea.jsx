
export default function Textarea({
    className = "",
    rows = 4,
    ...props
}) {
    return (
        <textarea className={`textarea ${className}`.trim()} rows={rows} {...props}/>
    );
};