import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { useClickOutside } from "../../hooks/useClickOutside";

/* ==================================================
   USE CLICK OUTSIDE TESTS
   Tests outside click detection behavior

   Handles:
   - outside click callback
   - inside click ignore
   - disabled listener state
================================================== */

function TestComponent({ onOutsideClick, enabled = true }) {
    const boxRef = useRef(null);

    useClickOutside(boxRef, onOutsideClick, enabled);

    return (
        <div>
            <div ref={boxRef}>
                <button type="button">Inside</button>
            </div>

            <button type="button">Outside</button>
        </div>
    );
}

describe("useClickOutside", () => {

    /* =============================
       CLICK BEHAVIOR
    ============================= */

    it("calls callback when clicking outside the referenced element", async () => {
        const user = userEvent.setup();
        const mockOutsideClick = vi.fn();

        render(<TestComponent onOutsideClick={mockOutsideClick} />);

        await user.click(screen.getByRole("button", { name: "Outside" }));

        expect(mockOutsideClick).toHaveBeenCalledTimes(1);
    });

    it("does not call callback when clicking inside the referenced element", async () => {
        const user = userEvent.setup();
        const mockOutsideClick = vi.fn();

        render(<TestComponent onOutsideClick={mockOutsideClick} />);

        await user.click(screen.getByRole("button", { name: "Inside" }));

        expect(mockOutsideClick).not.toHaveBeenCalled();
    });


    /* =============================
       DISABLED STATE
    ============================= */

    it("does not call callback when disabled", async () => {
        const user = userEvent.setup();
        const mockOutsideClick = vi.fn();

        render(
            <TestComponent
                onOutsideClick={mockOutsideClick}
                enabled={false}
            />
        );

        await user.click(screen.getByRole("button", { name: "Outside" }));

        expect(mockOutsideClick).not.toHaveBeenCalled();
    });
});
