import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";

// Mocks
let mockUser = null;
const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock("../../../context/useAuth", () => ({
    useAuth: () => ({
        user: mockUser,
        logout: mockLogout
    })
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

function renderNavbar() {
    return render(
        <MemoryRouter>
            <Navbar />
        </MemoryRouter>
    );
}

describe("Navbar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render public navigation when not authenticated", () => {
        mockUser = null;

        renderNavbar();

        expect(screen.getByText("Login")).toBeInTheDocument();
        expect(screen.getByText("Register")).toBeInTheDocument();
        expect(screen.queryByText("Create event")).not.toBeInTheDocument();
    });

    it("should render user navigation when authenticated", () => {
        mockUser = { name: "John" };

        renderNavbar();

        expect(screen.getByText("John")).toBeInTheDocument();
        expect(screen.getByText("Create event")).toBeInTheDocument();
    });

    it("should open and close user menu", async () => {
        const user = userEvent.setup();
        mockUser = { name: "John" };

        renderNavbar();

        const trigger = screen.getByRole("button", { name: /open user menu/i });

        await user.click(trigger);

        expect(screen.getByText("My Profile")).toBeInTheDocument();

        await user.click(document.body); // outside click

        await waitFor(() => {
            expect(screen.queryByText("My Profile")).not.toBeInTheDocument();
        });
    });

    it("should logout and redirect", async () => {
        const user = userEvent.setup();
        mockUser = { name: "John" };

        renderNavbar();

        const trigger = screen.getByRole("button", { name: /open user menu/i });

        await user.click(trigger);
        await user.click(screen.getByText("Logout"));

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });
    });
});