import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PasswordRules from "../../../components/ui/PasswordRules";

const getRule = (text) => screen.getByText(text).closest(".password-rule");

describe("PasswordRules", () => {
    it("should display all password rules", () => {
        render(<PasswordRules password="" />);

        expect(screen.getByText(/your password must contain/i)).toBeInTheDocument();
        expect(screen.getByText(/6 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/1 uppercase/i)).toBeInTheDocument();
        expect(screen.getByText(/1 number/i)).toBeInTheDocument();
    });

    it("should show all rules as invalid when password is empty", () => {
        render(<PasswordRules password="" />);

        expect(getRule(/6 characters/i)).not.toHaveClass("valid");
        expect(getRule(/1 uppercase/i)).not.toHaveClass("valid");
        expect(getRule(/1 number/i)).not.toHaveClass("valid");
    });

    it("should validate length rule", () => {
        render(<PasswordRules password="abcdef" />);

        expect(getRule(/6 characters/i)).toHaveClass("valid");
    });

    it("should validate uppercase rule", () => {
        render(<PasswordRules password="Abcdef" />);

        expect(getRule(/1 uppercase/i)).toHaveClass("valid");
    });

    it("should validate number rule", () => {
        render(<PasswordRules password="abcde1" />);

        expect(getRule(/1 number/i)).toHaveClass("valid");
    });

    it("should validate all rules when password is strong", () => {
        render(<PasswordRules password="Abc123" />);

        expect(getRule(/6 characters/i)).toHaveClass("valid");
        expect(getRule(/1 uppercase/i)).toHaveClass("valid");
        expect(getRule(/1 number/i)).toHaveClass("valid");
    });
});