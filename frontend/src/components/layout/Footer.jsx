import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

/* ==================================================
   FOOTER
   Displays application footer navigation and metadata

   Handles:
   - public footer navigation
   - authenticated user footer navigation
   - application branding and copyright
================================================== */

export default function Footer() {
    const { user } = useAuth();

    return (
        <footer className="footer">
            <div className="container footer-inner">

                {/* Brand */}
                <div className="footer-brand">
                    <p className="footer-logo">PlanTogether</p>
                </div>

                {/* Footer navigation */}
                <nav className="footer-links" aria-label="Footer navigation">
                    <Link to="/" className="footer-link">Home</Link>
                    <Link to="/events" className="footer-link">Events</Link>

                    {user && (
                        <>
                            <Link to="/my-events" className="footer-link">My Events</Link>
                            <Link to="/profile" className="footer-link">Profile</Link>
                        </>
                    )}
                </nav>

                {/* Metadata */}
                <div className="footer-meta">
                    <p>© 2026 PlanTogether</p>
                </div>

            </div>
        </footer>
    );
}
