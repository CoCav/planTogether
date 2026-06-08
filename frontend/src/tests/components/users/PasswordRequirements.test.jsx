import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import PasswordRequirements from "../../../components/users/PasswordRequirements";

/* ==================================================
   PASSWORD REQUIREMENTS TESTS
   Tests live password requirement display

   Handles:
   - requirement text rendering
   - accessible list semantics
   - valid requirement state display
   - decorative icon accessibility
================================================== */

describe("PasswordRequirements", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderPasswordRequirements = (password = "") => {
        return render(
            <PasswordRequirements password={password} />
        );
    };

    /* =============================
       RENDERING
    ============================= */

    it("renders password requirement title", () => {
        renderPasswordRequirements();

        expect(screen.getByText("Your password must contain at least:")).toBeInTheDocument();
    });

    it("applies optional helper id", () => {
        render(
            <PasswordRequirements
                id="newPassword-requirements"
                password=""
            />
        );

        expect(
            screen.getByText("Your password must contain at least:").parentElement
        ).toHaveAttribute("id", "newPassword-requirements");
    });

    it("renders all password requirements", () => {
        renderPasswordRequirements();

        expect(screen.getByText("8 characters")).toBeInTheDocument();
        expect(screen.getByText("1 uppercase")).toBeInTheDocument();
        expect(screen.getByText("1 lowercase")).toBeInTheDocument();
        expect(screen.getByText("1 number")).toBeInTheDocument();
    });

    it("renders requirements as an accessible list", () => {
        renderPasswordRequirements();

        expect(screen.getByRole("list")).toHaveClass("password-rules-list");
        expect(screen.getAllByRole("listitem")).toHaveLength(4);
    });

    it("hides requirement icons from assistive technologies", () => {
        renderPasswordRequirements();

        const icons = document.querySelectorAll(
            ".password-rule-icon[aria-hidden='true']"
        );

        expect(icons).toHaveLength(4);
    });

    /* =============================
       VALID STATE
    ============================= */

    it("marks no requirements as valid for an empty password", () => {
        renderPasswordRequirements("");

        screen.getAllByRole("listitem").forEach((item) => {
            expect(item).not.toHaveClass("is-valid");
        });
    });

    it("marks matching requirements as valid", () => {
        renderPasswordRequirements("Password1");

        expect(screen.getByText("8 characters").closest("li")).toHaveClass("is-valid");
        expect(screen.getByText("1 uppercase").closest("li")).toHaveClass("is-valid");
        expect(screen.getByText("1 lowercase").closest("li")).toHaveClass("is-valid");
        expect(screen.getByText("1 number").closest("li")).toHaveClass("is-valid");
    });

    it("does not mark unmatched requirements as valid", () => {
        renderPasswordRequirements("password");

        expect(screen.getByText("8 characters").closest("li")).toHaveClass("is-valid");
        expect(screen.getByText("1 lowercase").closest("li")).toHaveClass("is-valid");

        expect(screen.getByText("1 uppercase").closest("li")).not.toHaveClass("is-valid");
        expect(screen.getByText("1 number").closest("li")).not.toHaveClass("is-valid");
    });
});
