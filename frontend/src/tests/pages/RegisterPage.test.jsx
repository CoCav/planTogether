import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RegisterPage from "../../pages/RegisterPage";

/* ==================================================
   REGISTER PAGE TESTS
   Tests account registration page behavior

   Handles:
   - register page rendering
   - user form validation
   - field and password interactions
   - avatar upload and removal
   - successful registration flow
   - automatic login after registration
   - protected route redirect restoration
   - stale pagination cleanup after registration
   - register error feedback
   - login navigation state forwarding
   - decorative account navigation icon

   Notes:
   - mocks auth context login action
   - mocks register API request
   - uses MemoryRouter for account navigation link
================================================== */

/* =============================
   MOCK DATA
============================= */

const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockRegisterUser = vi.fn();
let mockLocationState = null;

/* =============================
   MOCKS
============================= */

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");

    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useLocation: () => ({
            state: mockLocationState
        })
    };
});

vi.mock("../../features/auth/hooks/useAuth", () => ({
    useAuth: () => ({
        login: mockLogin
    })
}));

vi.mock("../../api/auth/authApi", () => ({
    registerUser: (...args) => mockRegisterUser(...args)
}));

/* =============================
   TEST HELPERS
============================= */

const fillRegisterForm = async (user, {
    name = "John Doe",
    email = "john@test.com",
    password = "Password123"
} = {}
) => {
    await user.type(screen.getByLabelText("Name"), name);
    await user.type(screen.getByLabelText("Email"), email);
    await user.type(screen.getByLabelText("Password"), password);
};

const selectAvatar = async (
    user,
    file = new File(
        ["avatar"],
        "avatar.png",
        {
            type: "image/png"
        }
    )
) => {
    await user.upload(screen.getByLabelText("Avatar (optional)"), file);

    return file;
};

const LoginLocationStateProbe = () => {
    const location = useLocation();

    return (
        <div>
            Login Page - from {location.state?.from?.pathname}
            {location.state?.from?.search}
        </div>
    );
};

const renderPage = () =>
    render(
        <MemoryRouter>
            <RegisterPage />
        </MemoryRouter>
    );

const renderPageWithLoginRoute = () =>
    render(
        <MemoryRouter initialEntries={["/register"]}>
            <Routes>
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginLocationStateProbe />} />
            </Routes>
        </MemoryRouter>
    );

describe("RegisterPage", () => {

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        globalThis.URL.createObjectURL = vi.fn(
            () => "blob:avatar-preview"
        );

        globalThis.URL.revokeObjectURL = vi.fn();

        mockLocationState = null;
    });

    /* =============================
       PAGE RENDERING
    ============================= */

    it("renders the register page", () => {
        renderPage();

        expect(screen.getByRole("heading", {
            name: "Register"
        })).toBeInTheDocument();

        expect(screen.getByText("Create your account and start organizing events.")).toBeInTheDocument();

        expect(screen.getByLabelText("Avatar (optional)")).toBeInTheDocument();

        expect(screen.getByLabelText("Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();

        expect(screen.getByText(
            "Your password must contain at least:"
        )).toBeInTheDocument();

        expect(screen.getByRole("button", {
            name: "Register"
        })).toBeInTheDocument();

        expect(screen.getByRole("link", {
            name: "Login"
        })).toHaveAttribute("href", "/login");
    });

    it("renders the register section with accessible label", () => {
        renderPage();

        expect(screen.getByRole("region", {
            name: "Registration form"
        })).toHaveClass("account-section");
    });

    /* =============================
       FORM VALIDATION
    ============================= */

    it("shows validation errors when submitting empty form", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.click(screen.getByRole("button", {
            name: "Register"
        }));

        expect(screen.getByText("Name is required")).toBeInTheDocument();
        expect(screen.getByText("Email is required")).toBeInTheDocument();
        expect(screen.getByText("Password is required")).toBeInTheDocument();

        expect(mockRegisterUser).not.toHaveBeenCalled();
    });

    it("clears field error when user edits input", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.click(screen.getByRole("button", {
            name: "Register"
        }));

        expect(screen.getByText("Name is required")).toBeInTheDocument();

        await user.type(screen.getByLabelText("Name"), "John");

        expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
    });

    /* =============================
       FORM INTERACTIONS
    ============================= */

    it("updates input values when typing", async () => {
        const user = userEvent.setup();

        renderPage();

        await fillRegisterForm(user);

        expect(screen.getByLabelText("Name")).toHaveValue("John Doe");
        expect(screen.getByLabelText("Email")).toHaveValue("john@test.com");
        expect(screen.getByLabelText("Password")).toHaveValue("Password123");
    });

    /* =============================
       AVATAR INTERACTIONS
    ============================= */

    it("shows avatar preview when selecting a valid file", async () => {
        const user = userEvent.setup();

        renderPage();

        await selectAvatar(user);

        expect(screen.getByAltText("Avatar preview")).toHaveAttribute("src", "blob:avatar-preview");

        expect(screen.getByText("avatar.png")).toBeInTheDocument();

        expect(screen.getByRole("button", {
            name: "Remove avatar"
        })).toBeInTheDocument();
    });

    it("removes selected avatar when clicking remove", async () => {
        const user = userEvent.setup();

        renderPage();

        await selectAvatar(user);

        await user.click(screen.getByRole("button", {
            name: "Remove avatar"
        }));

        expect(screen.queryByAltText("Avatar preview")).not.toBeInTheDocument();

        expect(screen.queryByText("avatar.png")).not.toBeInTheDocument();
    });

    /* =============================
       PASSWORD INTERACTIONS
    ============================= */

    it("toggles password visibility", async () => {
        const user = userEvent.setup();

        renderPage();

        const passwordInput = screen.getByLabelText("Password");

        expect(passwordInput).toHaveAttribute("type", "password");

        await user.click(screen.getByRole("button", {
            name: "Show password"
        }));

        expect(passwordInput).toHaveAttribute("type", "text");

        await user.click(screen.getByRole("button", {
            name: "Hide password"
        }));

        expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("displays password requirements", () => {
        renderPage();

        expect(screen.getByText("8 characters")).toBeInTheDocument();
        expect(screen.getByText("1 uppercase")).toBeInTheDocument();
        expect(screen.getByText("1 lowercase")).toBeInTheDocument();
        expect(screen.getByText("1 number")).toBeInTheDocument();
    });

    /* =============================
       SUBMISSION
    ============================= */

    it("registers successfully and redirects", async () => {
        const user = userEvent.setup();

        mockRegisterUser.mockResolvedValue({
            token: "fake-token"
        });

        mockLogin.mockResolvedValue();

        renderPage();

        await fillRegisterForm(user);

        await user.click(screen.getByRole("button", {
            name: "Register"
        }));

        await waitFor(() => {
            expect(mockRegisterUser).toHaveBeenCalledWith(expect.any(FormData));
        });

        const formData = mockRegisterUser.mock.calls[0][0];

        expect(formData.get("name")).toBe("John Doe");
        expect(formData.get("email")).toBe("john@test.com");
        expect(formData.get("password")).toBe("Password123");
        expect(formData.get("avatar")).toBeNull();

        expect(mockLogin).toHaveBeenCalledWith("fake-token");
        expect(mockNavigate).toHaveBeenCalledWith("/events", {
            replace: true
        });
    });

    it("removes stale pagination when redirecting after registration", async () => {
        const user = userEvent.setup();

        mockLocationState = {
            from: {
                pathname: "/my-events",
                search: "?view=joined&page=2"
            }
        };

        mockRegisterUser.mockResolvedValue({
            token: "fake-token"
        });

        mockLogin.mockResolvedValue();

        renderPage();

        await fillRegisterForm(user);

        await user.click(screen.getByRole("button", {
            name: "Register"
        }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/my-events?view=joined", {
                replace: true
            });
        });
    });

    it("redirects to events page by default after registration", async () => {
        const user = userEvent.setup();

        mockLocationState = null;

        mockRegisterUser.mockResolvedValue({
            token: "fake-token"
        });

        mockLogin.mockResolvedValue();

        renderPage();

        await fillRegisterForm(user);

        await user.click(screen.getByRole("button", {
            name: "Register"
        }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/events", {
                replace: true
            });
        });
    });

    it("registers successfully with avatar", async () => {
        const user = userEvent.setup();

        const avatar = new File(["avatar"], "avatar.png", {
            type: "image/png"
        });

        mockRegisterUser.mockResolvedValue({
            token: "fake-token"
        });

        mockLogin.mockResolvedValue();

        renderPage();

        await selectAvatar(user, avatar);

        await fillRegisterForm(user);

        await user.click(screen.getByRole("button", {
            name: "Register"
        }));

        await waitFor(() => {
            expect(mockRegisterUser).toHaveBeenCalledWith(expect.any(FormData));
        });

        const formData = mockRegisterUser.mock.calls[0][0];

        expect(formData.get("avatar")).toBe(avatar);

        expect(mockLogin).toHaveBeenCalledWith("fake-token");
        expect(mockNavigate).toHaveBeenCalledWith("/events", {
            replace: true
        });
    });

    it("shows loading state while submitting", async () => {
        const user = userEvent.setup();

        let resolveRequest;

        mockRegisterUser.mockImplementation(() =>
            new Promise((resolve) => {
                resolveRequest = resolve;
            })
        );

        renderPage();

        await fillRegisterForm(user);

        await user.click(screen.getByRole("button", {
            name: "Register"
        }));

        expect(screen.getByRole("button", {
            name: "Loading..."
        })).toBeDisabled();

        resolveRequest({
            token: "fake-token"
        });
    });

    /* =============================
       LOGIN NAVIGATION
    ============================= */

    it("forwards protected route state when navigating to login", async () => {
        const user = userEvent.setup();

        mockLocationState = {
            from: {
                pathname: "/my-events",
                search: "?view=joined&page=2"
            }
        };

        renderPageWithLoginRoute();

        await user.click(screen.getByRole("link", {
            name: "Login"
        }));

        expect(screen.getByText("Login Page - from /my-events?view=joined&page=2")).toBeInTheDocument();
    });

    /* =============================
       ERROR HANDLING
    ============================= */

    it("shows error message when register fails", async () => {
        const user = userEvent.setup();

        mockRegisterUser.mockRejectedValue({});

        renderPage();

        await fillRegisterForm(user);

        await user.click(screen.getByRole("button", {
            name: "Register"
        }));

        expect(await screen.findByText(
            "Unable to register. Please check your information."
        )).toBeInTheDocument();

        expect(mockLogin).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
