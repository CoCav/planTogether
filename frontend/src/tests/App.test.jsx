import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import App from "../App";

/* ==================================================
   APP TESTS
   Tests the global application shell

   Handles:
   - global layout rendering
   - navbar rendering
   - routed page rendering
   - footer rendering
   - main landmark structure
================================================== */

vi.mock("../components/layout/Navbar", () => ({
    default: () => <header>Navbar</header>
}));

vi.mock("../components/layout/Footer", () => ({
    default: () => <footer>Footer</footer>
}));

vi.mock("../routes/AppRouter", () => ({
    default: () => <main>Page content</main>
}));

describe("App", () => {

    /* =============================
       GLOBAL LAYOUT
    ============================= */

    it("renders the global application shell", () => {
        render(<App />);

        expect(screen.getByText("Navbar")).toBeInTheDocument();
        expect(screen.getByText("Page content")).toBeInTheDocument();
        expect(screen.getByText("Footer")).toBeInTheDocument();
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("does not create nested main landmarks", () => {
        render(<App />);

        expect(screen.getAllByRole("main")).toHaveLength(1);
    });
});
