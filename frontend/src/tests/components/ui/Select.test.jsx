import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Select from "../../../components/ui/Select";

/* ==================================================
   SELECT TESTS
   Tests select rendering, error state and icon behavior
================================================== */

describe("Select", () => {
    it("renders options", () => {
        render(
            <Select>
                <option value="1">Option 1</option>
            </Select>
        );

        expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    it("applies custom class to wrapper", () => {
        const { container } = render(<Select className="custom" />);

        expect(container.firstChild).toHaveClass("select-wrapper");
        expect(container.firstChild).toHaveClass("custom");
    });

    it("applies error class to wrapper and select", () => {
        const { container } = render(<Select error />);

        expect(container.firstChild).toHaveClass("error");
        expect(screen.getByRole("combobox")).toHaveClass("error");
    });

    it("toggles icon state on focus and blur", async () => {
        const user = userEvent.setup();

        render(
            <Select>
                <option>Test</option>
            </Select>
        );

        const select = screen.getByRole("combobox");
        const icon = document.querySelector(".select-icon");

        await user.click(select);
        expect(icon).toHaveClass("is-open");

        await user.tab();
        expect(icon).not.toHaveClass("is-open");
    });
});
