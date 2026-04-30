import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import TextArea from "../../../components/ui/TextArea";

/* ==================================================
   TEXTAREA TESTS
   Tests styled textarea rendering and props forwarding
================================================== */

describe("TextArea", () => {
    it("renders textarea with base class and default rows", () => {
        render(<TextArea placeholder="Description" />);

        const textarea = screen.getByPlaceholderText("Description");

        expect(textarea).toHaveClass("textarea");
        expect(textarea).toHaveAttribute("rows", "4");
    });

    it("supports custom rows", () => {
        render(<TextArea placeholder="Description" rows={8} />);

        expect(screen.getByPlaceholderText("Description")).toHaveAttribute(
            "rows",
            "8"
        );
    });

    it("applies error and custom classes", () => {
        render(
            <TextArea
                placeholder="Description"
                error
                className="custom-textarea"
            />
        );

        expect(screen.getByPlaceholderText("Description")).toHaveClass(
            "error",
            "custom-textarea"
        );
    });

    it("calls onChange when value changes", () => {
        const onChange = vi.fn();

        render(<TextArea placeholder="Description" onChange={onChange} />);

        fireEvent.change(screen.getByPlaceholderText("Description"), {
            target: { value: "New text" },
        });

        expect(onChange).toHaveBeenCalled();
    });
});
