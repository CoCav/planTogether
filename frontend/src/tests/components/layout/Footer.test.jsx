import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "../../../components/layout/Footer";

/* ==================================================
   FOOTER TESTS
   Tests public and authenticated footer links
================================================== */

let mockUser = null;

vi.mock("../../../context/useAuth", () => ({
    useAuth: () => ({
        user: mockUser
    })
}));

const renderFooter = () =>
    render(
        <MemoryRouter>
            <Footer />
        </MemoryRouter>
    );

describe("Footer", () => {
    it("renders public links", () => {
        mockUser = null;

        renderFooter();

        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("Events")).toBeInTheDocument();
    });

    it("does not render private links when user is not authenticated", () => {
        mockUser = null;

        renderFooter();

        expect(screen.queryByText("My Events")).not.toBeInTheDocument();
        expect(screen.queryByText("Profile")).not.toBeInTheDocument();
    });

    it("renders private links when user is authenticated", () => {
        mockUser = { name: "John" };

        renderFooter();

        expect(screen.getByText("My Events")).toBeInTheDocument();
        expect(screen.getByText("Profile")).toBeInTheDocument();
    });
});
