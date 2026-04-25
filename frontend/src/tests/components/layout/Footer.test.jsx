import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Footer from "../../../components/layout/Footer";

// Mock auth
let mockUser = null;

vi.mock("../../../context/useAuth", () => ({
    useAuth: () => ({
        user: mockUser
    })
}));

function renderFooter() {
    return render(
        <MemoryRouter>
            <Footer />
        </MemoryRouter>
    );
}

describe("Footer", () => {
    it("should render public links", () => {
        mockUser = null;

        renderFooter();

        expect(screen.getByText("Home")).toBeInTheDocument();
        expect(screen.getByText("Events")).toBeInTheDocument();
    });

    it("should NOT render private links when not authenticated", () => {
        mockUser = null;

        renderFooter();

        expect(screen.queryByText("My Events")).not.toBeInTheDocument();
        expect(screen.queryByText("Profile")).not.toBeInTheDocument();
    });

    it("should render private links when user is authenticated", () => {
        mockUser = { name: "John" };

        renderFooter();

        expect(screen.getByText("My Events")).toBeInTheDocument();
        expect(screen.getByText("Profile")).toBeInTheDocument();
    });
});