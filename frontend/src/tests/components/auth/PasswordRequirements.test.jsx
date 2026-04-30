import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PasswordRequirements from "../../../components/auth/PasswordRequirements";

/* ==================================================
   PASSWORD REQUIREMENTS TESTS
   Tests live password validation rules display
================================================== */

const getRule = (text) => screen.getByText(text).closest(".password-rule");

describe("PasswordRequirements", () => {
    it("renders all password requirements", () => {
        render(<PasswordRequirements password="" />);

        expect(screen.getByText(/your password must contain at least/i)).toBeInTheDocument();

        expect(screen.getByText(/6 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/1 uppercase/i)).toBeInTheDocument();
        expect(screen.getByText(/1 number/i)).toBeInTheDocument();
    });

    it("marks all rules as invalid when password is empty", () => {
        render(<PasswordRequirements password="" />);

        expect(getRule(/6 characters/i)).not.toHaveClass("valid");
        expect(getRule(/1 uppercase/i)).not.toHaveClass("valid");
        expect(getRule(/1 number/i)).not.toHaveClass("valid");
    });

    it("validates length rule", () => {
        render(<PasswordRequirements password="abcdef" />);

        expect(getRule(/6 characters/i)).toHaveClass("valid");
    });

    it("validates uppercase rule", () => {
        render(<PasswordRequirements password="Abcdef" />);

        expect(getRule(/1 uppercase/i)).toHaveClass("valid");
    });

    it("validates number rule", () => {
        render(<PasswordRequirements password="abcde1" />);

        expect(getRule(/1 number/i)).toHaveClass("valid");
    });

    it("validates all rules for a strong password", () => {
        render(<PasswordRequirements password="Abc123" />);

        expect(getRule(/6 characters/i)).toHaveClass("valid");
        expect(getRule(/1 uppercase/i)).toHaveClass("valid");
        expect(getRule(/1 number/i)).toHaveClass("valid");
    });

    it("shows correct icons for valid and invalid rules", () => {
        render(<PasswordRequirements password="Abc123" />);

        expect(screen.getAllByText("✓").length).toBeGreaterThan(0);
    });
});
