import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import UserProfileForm from "../../../components/auth/UserProfileForm";

/* ==================================================
   USER PROFILE FORM TESTS
   Tests profile update form rendering and actions
================================================== */

const form = {
    name: "John",
    email: "john@test.com"
};

describe("UserProfileForm", () => {
    it("renders profile fields", () => {
        render(
            <UserProfileForm
                form={form}
                errors={{}}
                submitting={false}
                onChange={vi.fn()}
                onSubmit={vi.fn()}
            />
        );

        expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Your email")).toBeInTheDocument();
    });

    it("calls onChange when fields change", () => {
        const onChange = vi.fn();

        render(
            <UserProfileForm
                form={form}
                errors={{}}
                submitting={false}
                onChange={onChange}
                onSubmit={vi.fn()}
            />
        );

        fireEvent.change(screen.getByPlaceholderText("Your name"), {
            target: { value: "Alice" }
        });

        expect(onChange).toHaveBeenCalled();
    });

    it("renders validation errors", () => {
        render(
            <UserProfileForm
                form={form}
                errors={{
                    name: "Name is required",
                    email: "Invalid email",
                }}
                submitting={false}
                onChange={vi.fn()}
                onSubmit={vi.fn()}
            />
        );

        expect(screen.getByText("Name is required")).toBeInTheDocument();
        expect(screen.getByText("Invalid email")).toBeInTheDocument();
    });

    it("calls onSubmit when form is submitted", () => {
        const onSubmit = vi.fn((e) => e.preventDefault());

        render(
            <UserProfileForm
                form={form}
                errors={{}}
                submitting={false}
                onChange={vi.fn()}
                onSubmit={onSubmit}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: /update profile/i }));

        expect(onSubmit).toHaveBeenCalled();
    });

    it("disables submit button while submitting", () => {
        render(
            <UserProfileForm
                form={form}
                errors={{}}
                submitting
                onChange={vi.fn()}
                onSubmit={vi.fn()}
            />
        );

        expect(screen.getByRole("button", { name: /loading/i })).toBeDisabled();
    });
});
