import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";

/* ==================================================
   NAVBAR TESTS
   Tests public navigation, user menu and logout flow
================================================== */

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

const renderNavbar = () =>
    render(
        <MemoryRouter>
            <Navbar />
        </MemoryRouter>
    );

describe("Navbar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUser = null;
    });

    it("renders public navigation when user is not authenticated", () => {
        renderNavbar();

        expect(screen.getByText("Login")).toBeInTheDocument();
        expect(screen.getByText("Register")).toBeInTheDocument();
        expect(screen.queryByText("Create event")).not.toBeInTheDocument();
    });

    it("renders user navigation when user is authenticated", () => {
        mockUser = {
            name: "John",
            avatar: null
        };

        renderNavbar();

        expect(screen.getByText("Create event")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /open john menu/i })).toBeInTheDocument();
        expect(screen.getByAltText("John avatar")).toBeInTheDocument();
        expect(screen.queryByText("John")).not.toBeInTheDocument();
    });

    it("opens and closes user menu", async () => {
        const user = userEvent.setup();

        mockUser = {
            name: "John",
            avatar: null
        };

        renderNavbar();

        const trigger = screen.getByRole("button", {
            name: /open john menu/i
        });

        await user.click(trigger);

        expect(screen.getByText("My Profile")).toBeInTheDocument();

        await user.click(document.body);

        await waitFor(() => {
            expect(screen.queryByText("My Profile")).not.toBeInTheDocument();
        });
    });

    it("logs out and redirects to home", async () => {
        const user = userEvent.setup();

        mockUser = {
            name: "John",
            avatar: null
        };

        renderNavbar();

        const trigger = screen.getByRole("button", {
            name: /open john menu/i
        });

        await user.click(trigger);
        await user.click(screen.getByText("Logout"));

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith("/");
        });
    });
});
