import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import Footer from "../../../components/layout/Footer";

/* ==================================================
   FOOTER TESTS
   Tests footer navigation rendering

   Handles:
   - public footer links
   - authenticated user footer links
   - guest footer visibility
   - app metadata rendering

   Notes:
   - mocks authenticated user state
   - uses MemoryRouter for footer links
================================================== */

let mockUser = null;

vi.mock("../../../features/auth/hooks/useAuth", () => ({
    useAuth: () => ({
        user: mockUser
    })
}));

describe("Footer", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderFooter = () =>
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );


    /* =============================
       PUBLIC LINKS
    ============================= */

    it("renders public links", () => {
        mockUser = null;

        renderFooter();

        expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
        expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute("href", "/events");
    });


    /* =============================
       AUTHENTICATED LINKS
    ============================= */

    it("does not render private links when user is not authenticated", () => {
        mockUser = null;

        renderFooter();

        expect(screen.queryByRole("link", { name: "My Events" })).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Profile" })).not.toBeInTheDocument();
    });

    it("renders private links when user is authenticated", () => {
        mockUser = { name: "John" };

        renderFooter();

        expect(screen.getByRole("link", { name: "My Events" })).toHaveAttribute("href", "/my-events");
        expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/profile");
    });


    /* =============================
       APP METADATA
    ============================= */

    it("renders app brand and copyright", () => {
        mockUser = null;

        renderFooter();

        expect(screen.getByText("PlanTogether")).toBeInTheDocument();
        expect(screen.getByText("© 2026 PlanTogether")).toBeInTheDocument();
    });
});
