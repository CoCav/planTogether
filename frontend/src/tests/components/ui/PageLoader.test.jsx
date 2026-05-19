import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import PageLoader from "../../../components/ui/PageLoader";

/* ==================================================
   PAGE LOADER TESTS
   Tests full-page loading wrapper rendering

   Handles:
   - default loading message
   - custom loading message
   - page layout wrapper

   Notes:
   - focuses on layout wrapper behavior
   - wraps LoadingState component
================================================== */

describe("PageLoader", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderPageLoader = (children) => {
        return render(
            <PageLoader>
                {children}
            </PageLoader>
        );
    };

    /* =============================
       RENDERING
    ============================= */

    it("should render default loading message", () => {
        render(<PageLoader />);

        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should render custom loading message", () => {
        renderPageLoader("Loading profile...");

        expect(screen.getByText("Loading profile...")).toBeInTheDocument();
    });

    /* =============================
       LAYOUT WRAPPER
    ============================= */

    it("should render page layout wrapper", () => {
        render(<PageLoader />);

        const loader = screen.getByText("Loading...");

        expect(loader.closest(".container.page-section")).toBeInTheDocument();
    });
});
