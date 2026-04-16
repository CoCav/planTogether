
export default function LoadingState({ children = "Loading..." }) {
    return <div className="loading-state">{children}</div>;
};