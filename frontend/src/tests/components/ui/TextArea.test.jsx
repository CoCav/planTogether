import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import TextArea from "../../../components/ui/TextArea";

/* ==================================================
   TEXTAREA TESTS
   Tests styled textarea rendering and behavior

   Handles:
   - base class rendering
   - default rows and resize behavior
   - custom rows and resize behavior
   - error accessibility state
   - custom classes
   - change handling
================================================== */

describe("TextArea", () => {
    it("renders textarea with base class, default rows and default resize", () => {
        render(<TextArea placeholder="Description" />);

        const textarea = screen.getByPlaceholderText("Description");

        expect(textarea).toHaveClass("textarea");
        expect(textarea).toHaveClass("textarea-resize-vertical");
        expect(textarea).toHaveAttribute("rows", "4");
        expect(textarea).toHaveAttribute("aria-invalid", "false");
    });

    it("supports custom rows", () => {
        render(<TextArea placeholder="Description" rows={8} />);

        expect(screen.getByPlaceholderText("Description")).toHaveAttribute("rows", "8");
    });

    it("supports custom resize behavior", () => {
        render(<TextArea placeholder="Description" resize="none" />);

        expect(screen.getByPlaceholderText("Description")).toHaveClass(
            "textarea-resize-none"
        );
    });

    it("applies error state and accessibility attribute", () => {
        render(
            <TextArea
                placeholder="Description"
                error
            />
        );

        const textarea = screen.getByPlaceholderText("Description");

        expect(textarea).toHaveClass("error");
        expect(textarea).toHaveAttribute("aria-invalid", "true");
    });

    it("applies custom classes", () => {
        render(
            <TextArea
                placeholder="Description"
                className="custom-textarea"
            />
        );

        expect(screen.getByPlaceholderText("Description")).toHaveClass(
            "custom-textarea"
        );
    });

    it("calls onChange when value changes", () => {
        const onChange = vi.fn();

        render(<TextArea placeholder="Description" onChange={onChange} />);

        fireEvent.change(screen.getByPlaceholderText("Description"), {
            target: {
                value: "New text"
            }
        });

        expect(onChange).toHaveBeenCalled();
    });
});
