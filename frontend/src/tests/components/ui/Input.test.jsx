import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Input from "../../../components/ui/Input";

/* ==================================================
   INPUT TESTS
   Tests styled input rendering and props forwarding
================================================== */

describe("Input", () => {
    it("renders input with base class", () => {
        render(<Input placeholder="Your name" />);

        expect(screen.getByPlaceholderText("Your name")).toHaveClass("input");
    });

    it("applies error class", () => {
        render(<Input placeholder="Your email" error />);

        expect(screen.getByPlaceholderText("Your email")).toHaveClass("error");
    });

    it("applies custom class", () => {
        render(<Input placeholder="Search" className="custom-input" />);

        expect(screen.getByPlaceholderText("Search")).toHaveClass("custom-input");
    });

    it("forwards native input props", () => {
        const onChange = vi.fn();

        render(
            <Input
                type="email"
                name="email"
                value=""
                onChange={onChange}
                placeholder="Email"
            />
        );

        fireEvent.change(screen.getByPlaceholderText("Email"), {
            target: { value: "john@test.com" }
        });

        expect(onChange).toHaveBeenCalled();
    });
});
