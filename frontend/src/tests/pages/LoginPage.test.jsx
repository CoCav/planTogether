import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../../pages/LoginPage";

// ----------------------
// Mocks
// ----------------------

const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockLoginUser = vi.fn();

// Router mock
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: {
        from: {
          pathname: "/events/42/edit"
        }
      }
    })
  };
});

// Auth context mock
vi.mock("../../context/useAuth.js", () => ({
  useAuth: () => ({
    login: mockLogin
  })
}));

// API mock
vi.mock("../../api/authApi", () => ({
  loginUser: (...args) => mockLoginUser(...args)
}));

// Validation mock
vi.mock("../../features/auth/authValidation.js", () => ({
  validateLoginForm: vi.fn((form) => {
    const errors = {};
    if (!form.email) errors.email = "Email is required";
    if (!form.password) errors.password = "Password is required";
    return errors;
  })
}));

// ----------------------
// Helper
// ----------------------

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

// ----------------------
// Tests
// ----------------------

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the login form", () => {
    renderPage();

    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^login$/i })).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("should show validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /^login$/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();

    expect(mockLoginUser).not.toHaveBeenCalled();
  });

  it("should toggle password visibility", async () => {
    const user = userEvent.setup();
    renderPage();

    const passwordInput = screen.getByPlaceholderText(/your password/i);

    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: /show/i }));
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: /hide/i }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("should allow remember me to be checked", async () => {
    const user = userEvent.setup();
    renderPage();

    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it("should login successfully and redirect to previous page", async () => {
    const user = userEvent.setup();

    mockLoginUser.mockResolvedValue({ data: { token: "fake-token" } });

    mockLogin.mockResolvedValue();

    renderPage();

    const emailInput = screen.getByPlaceholderText(/your email/i);
    const passwordInput = screen.getByPlaceholderText(/your password/i);

    await user.type(emailInput, "test@test.com");
    await user.type(passwordInput, "Password123");

    await user.click(screen.getByRole("checkbox"));

    await user.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => { expect(mockLoginUser).toHaveBeenCalledWith({ email: "test@test.com", password: "Password123" }) });

    expect(mockLogin).toHaveBeenCalledWith("fake-token", true);

    expect(mockNavigate).toHaveBeenCalledWith("/events/42/edit", { replace: true });
  });

  it("should show an error message when login fails", async () => {
    const user = userEvent.setup();

    mockLoginUser.mockRejectedValue(new Error("Login failed"));

    renderPage();

    const emailInput = screen.getByPlaceholderText(/your email/i);
    const passwordInput = screen.getByPlaceholderText(/your password/i);

    await user.type(emailInput, "test@test.com");
    await user.type(passwordInput, "Password123");

    await user.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => { expect(screen.getByText(/unable to login\. please check your credentials\./i)).toBeInTheDocument() });

    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});