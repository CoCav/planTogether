import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Select from "../../../components/ui/Select";

describe("Select", () => {
    it("should render options", () => {
        render(
            <Select>
                <option value="1">Option 1</option>
            </Select>
        );

        expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    it("should apply custom class", () => {
        const { container } = render(<Select className="custom" />);

        expect(container.firstChild).toHaveClass("select-wrapper");
        expect(container.firstChild).toHaveClass("custom");
    });

    it("should toggle icon state on focus and blur", async () => {
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