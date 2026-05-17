import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AppRouter from "../../routes/AppRouter";

import { createAuthenticatedUser } from "../factories/users/userFactory";

/* ==================================================
   APP ROUTER TESTS
   Tests application route registration

   Handles:
   - public route rendering
   - protected route rendering through ProtectedRoute

   Notes:
   - uses reusable authenticated user factories
================================================== */

const mockUseAuth = vi.fn();

vi.mock("../../features/auth/hooks/useAuth", () => ({
    useAuth: () => mockUseAuth()
}));

vi.mock("../../pages/HomePage", () => ({
    default: () => <div>Home Page</div>
}));

vi.mock("../../pages/LoginPage", () => ({
    default: () => <div>Login Page</div>
}));

vi.mock("../../pages/RegisterPage", () => ({
    default: () => <div>Register Page</div>
}));

vi.mock("../../pages/EventsPage", () => ({
    default: () => <div>Events Page</div>
}));

vi.mock("../../pages/EventDetailsPage", () => ({
    default: () => <div>Event Details Page</div>
}));

vi.mock("../../pages/ProfilePage", () => ({
    default: () => <div>Profile Page</div>
}));

vi.mock("../../pages/MyEventsPage", () => ({
    default: () => <div>My Events Page</div>
}));

vi.mock("../../pages/CreateEventPage", () => ({
    default: () => <div>Create Event Page</div>
}));

vi.mock("../../pages/EditEventPage", () => ({
    default: () => <div>Edit Event Page</div>
}));

vi.mock("../../components/ui/PageLoader", () => ({
    default: ({ children }) => <div>{children}</div>
}));

describe("AppRouter", () => {

    beforeEach(() => {
        vi.clearAllMocks();

        mockUseAuth.mockReturnValue({
            user: createAuthenticatedUser(),
            loading: false
        });
    });

    /* =============================
       TEST HELPERS
    ============================= */

    // Render app router with initial route
    const renderWithRouter = (initialRoute) => {
        return render(
            <MemoryRouter initialEntries={[initialRoute]}>
                <AppRouter />
            </MemoryRouter>
        );
    };

    /* =============================
       PUBLIC ROUTES
    ============================= */

    it("should render home route", () => {
        renderWithRouter("/");

        expect(screen.getByText("Home Page")).toBeInTheDocument();
    });

    it("should render login route", () => {
        renderWithRouter("/login");

        expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    it("should render register route", () => {
        renderWithRouter("/register");

        expect(screen.getByText("Register Page")).toBeInTheDocument();
    });

    it("should render events route", () => {
        renderWithRouter("/events");

        expect(screen.getByText("Events Page")).toBeInTheDocument();
    });

    it("should render event details route", () => {
        renderWithRouter("/events/1");

        expect(screen.getByText("Event Details Page")).toBeInTheDocument();
    });

    /* =============================
       PROTECTED ROUTES
    ============================= */

    it("should render profile route when authenticated", () => {
        renderWithRouter("/profile");

        expect(screen.getByText("Profile Page")).toBeInTheDocument();
    });

    it("should render my events route when authenticated", () => {
        renderWithRouter("/my-events");

        expect(screen.getByText("My Events Page")).toBeInTheDocument();
    });

    it("should render create event route when authenticated", () => {
        renderWithRouter("/events/create");

        expect(screen.getByText("Create Event Page")).toBeInTheDocument();
    });

    it("should render edit event route when authenticated", () => {
        renderWithRouter("/events/1/edit");

        expect(screen.getByText("Edit Event Page")).toBeInTheDocument();
    });
});
