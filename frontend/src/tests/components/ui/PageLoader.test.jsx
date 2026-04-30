import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PageLoader from "../../../components/ui/PageLoader";

/* ==================================================
   PAGE LOADER TESTS
   Tests full-page loading wrapper rendering
================================================== */

describe("PageLoader", () => {
    it("renders default loading text", () => {
        render(<PageLoader />);

        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("renders custom loading text", () => {
        render(<PageLoader>Loading profile...</PageLoader>);

        expect(screen.getByText("Loading profile...")).toBeInTheDocument();
    });

    it("renders page layout wrapper", () => {
        render(<PageLoader />);

        const loader = screen.getByText("Loading...");

        expect(loader.closest(".container.page-section")).toBeInTheDocument();
    });
});
