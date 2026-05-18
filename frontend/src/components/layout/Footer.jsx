import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

/* ==================================================
   FOOTER
   Displays app footer navigation and metadata

   Handles:
   - public navigation links
   - authenticated user navigation links
   - application branding and copyright
================================================== */

export default function Footer() {
    const { user } = useAuth();

    return (
        <footer className="footer">
            <div className="container footer-inner">

                {/* Logo */}
                <div className="footer-brand">
                    <p className="footer-logo">PlanTogether</p>
                </div>

                {/* Navigation */}
                <div className="footer-links">
                    <Link to="/" className="footer-link">Home</Link>
                    <Link to="/events" className="footer-link">Events</Link>

                    {user && (
                        <>
                            <Link to="/my-events" className="footer-link">My Events</Link>
                            <Link to="/profile" className="footer-link">Profile</Link>
                        </>
                    )}
                </div>

                {/* Meta */}
                <div className="footer-meta">
                    <p>© 2026 PlanTogether</p>
                </div>

            </div>
        </footer>
    );
}
