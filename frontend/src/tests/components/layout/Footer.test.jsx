import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import Footer from "../../../components/layout/Footer";

/* ==================================================
   FOOTER TESTS
   Tests footer navigation, branding, and metadata

   Handles:
   - public footer navigation
   - authenticated user footer navigation
   - guest footer visibility
   - footer semantic navigation
   - accessible footer navigation
   - application branding and copyright

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
       PUBLIC NAVIGATION
    ============================= */

    it("renders public footer links", () => {
        mockUser = null;

        renderFooter();

        expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
        expect(screen.getByRole("link", { name: "Events" })).toHaveAttribute("href", "/events");
    });


    /* =============================
       AUTHENTICATED NAVIGATION
    ============================= */

    it("does not render authenticated links for guests", () => {
        mockUser = null;

        renderFooter();

        expect(screen.queryByRole("link", { name: "My Events" })).not.toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Profile" })).not.toBeInTheDocument();
    });

    it("renders authenticated links for logged-in users", () => {
        mockUser = { name: "John" };

        renderFooter();

        expect(screen.getByRole("link", { name: "My Events" })).toHaveAttribute("href", "/my-events");
        expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/profile");
    });


    /* =============================
       SEMANTIC NAVIGATION
    ============================= */

    it("renders footer navigation landmark", () => {
        mockUser = null;

        renderFooter();

        expect(screen.getByRole("navigation", { name: "Footer navigation" })).toBeInTheDocument();
    });


    /* =============================
       BRANDING / METADATA
    ============================= */

    it("renders app brand and copyright", () => {
        mockUser = null;

        renderFooter();

        expect(screen.getByText("PlanTogether")).toBeInTheDocument();
        expect(screen.getByText("© 2026 PlanTogether")).toBeInTheDocument();
    });
});
