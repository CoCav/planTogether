import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import AuthPasswordField from "../../../components/auth/AuthPasswordField";

/* ==================================================
   AUTH PASSWORD FIELD TESTS
   Tests password input, toggle and errors
================================================== */

describe("AuthPasswordField", () => {
    it("renders password input and toggle button", () => {
        render(
            <AuthPasswordField
                label="Password"
                name="password"
                value=""
                placeholder="Your password"
                visible={false}
                onChange={vi.fn()}
                onToggle={vi.fn()}
            />
        );

        expect(screen.getByPlaceholderText("Your password")).toHaveAttribute("type", "password");
        expect(screen.getByRole("button", { name: /show/i })).toBeInTheDocument();
    });

    it("renders visible password input when visible is true", () => {
        render(
            <AuthPasswordField
                label="Password"
                name="password"
                value="secret"
                placeholder="Your password"
                visible
                onChange={vi.fn()}
                onToggle={vi.fn()}
            />
        );

        expect(screen.getByPlaceholderText("Your password")).toHaveAttribute("type", "text");
        expect(screen.getByRole("button", { name: /hide/i })).toBeInTheDocument();
    });

    it("calls onChange when input changes", () => {
        const onChange = vi.fn();

        render(
            <AuthPasswordField
                label="Password"
                name="password"
                value=""
                placeholder="Your password"
                visible={false}
                onChange={onChange}
                onToggle={vi.fn()}
            />
        );

        fireEvent.change(screen.getByPlaceholderText("Your password"), {
            target: { value: "Password1" },
        });

        expect(onChange).toHaveBeenCalled();
    });

    it("calls onToggle when toggle button is clicked", () => {
        const onToggle = vi.fn();

        render(
            <AuthPasswordField
                label="Password"
                name="password"
                value=""
                placeholder="Your password"
                visible={false}
                onChange={vi.fn()}
                onToggle={onToggle}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /show/i }));

        expect(onToggle).toHaveBeenCalled();
    });

    it("renders string error", () => {
        render(
            <AuthPasswordField
                label="Password"
                name="password"
                value=""
                placeholder="Your password"
                error="Password is required"
                visible={false}
                onChange={vi.fn()}
                onToggle={vi.fn()}
            />
        );

        expect(screen.getByText("Password is required")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Your password")).toHaveClass("error");
    });

    it("renders array errors", () => {
        render(
            <AuthPasswordField
                label="Password"
                name="password"
                value=""
                placeholder="Your password"
                error={["At least 6 characters", "At least 1 number"]}
                visible={false}
                onChange={vi.fn()}
                onToggle={vi.fn()}
            />
        );

        expect(screen.getByText("At least 6 characters")).toBeInTheDocument();
        expect(screen.getByText("At least 1 number")).toBeInTheDocument();
    });

    it("renders children", () => {
        render(
            <AuthPasswordField
                label="Password"
                name="password"
                value=""
                placeholder="Your password"
                visible={false}
                onChange={vi.fn()}
                onToggle={vi.fn()}
            >
                <p>Password helper</p>
            </AuthPasswordField>
        );

        expect(screen.getByText("Password helper")).toBeInTheDocument();
    });
});
