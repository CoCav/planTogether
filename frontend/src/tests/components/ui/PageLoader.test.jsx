import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import PageLoader from "../../../components/ui/PageLoader";

/* ==================================================
   PAGE LOADER TESTS
   Tests full-page loading wrapper rendering

   Handles:
   - default loading title
   - custom loading title
   - custom loading description
   - page layout wrapper

   Notes:
   - focuses on layout wrapper behavior
   - delegates loading feedback rendering to LoadingState
================================================== */

describe("PageLoader", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderPageLoader = (props = {}) => {
        return render(
            <PageLoader {...props} />
        );
    };

    /* =============================
       RENDERING
    ============================= */

    it("should render default loading title", () => {
        render(<PageLoader />);

        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should render custom loading title", () => {
        renderPageLoader({
            title: "Loading profile..."
        });

        expect(screen.getByText("Loading profile...")).toBeInTheDocument();
    });

    it("should render custom loading description", () => {
        renderPageLoader({
            title: "Loading profile...",
            description: "Please wait while we load your account details."
        });

        expect(screen.getByText("Please wait while we load your account details.")).toBeInTheDocument();
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
