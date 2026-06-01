import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import PublicUserPage from "../../../../pages/users/public/PublicUserPage";

import usePublicUserListingData from "../../../../features/users/public/hooks/usePublicUserListingData";

/* ==================================================
   PUBLIC USER PAGE TESTS
   Tests public user profile and event listing page

   Handles:
   - loading state
   - page rendering
   - public profile display
   - public event view tabs
   - created and joined event rendering
   - accessibility
   - empty state
   - error state
   - hook initialization
================================================== */

/* =============================
   MOCK STATE
============================= */

let mockHookState;

const mockSetActiveView = vi.fn();
const mockLoadData = vi.fn();

/* =============================
   MOCKS
============================= */

vi.mock("../../../../features/users/public/hooks/usePublicUserListingData", () => ({
    default: vi.fn(() => mockHookState)
}));

vi.mock("../../../../components/events/EventCard", () => ({
    default: ({ event }) => (
        <article>
            <h3>{event.title}</h3>
        </article>
    )
}));

vi.mock("../../../../components/users/UserAvatar", () => ({
    default: ({ src, name, className }) => (
        <img src={src} alt={`${name} avatar`} className={className} />
    )
}));

vi.mock("../../../../utils/uploadedFiles", () => ({
    getAvatar: vi.fn((avatar) => avatar || "default-avatar.png")
}));

/* =============================
   TEST DATA / HELPERS
============================= */

const createHookState = (overrides = {}) => ({
    profile: {
        user: {
            name: "Sakura",
            avatar: "/uploads/avatars/sakura.png"
        },
        stats: {
            createdEventsCount: 17,
            joinedEventsCount: 8
        }
    },

    visibleEvents: [
        {
            id: 1,
            title: "Created Event"
        }
    ],

    activeView: "created",
    setActiveView: mockSetActiveView,

    viewContent: {
        key: "created",
        title: "Created Events",
        subtitle: "Public events created by this user.",
        empty: "No created events found."
    },

    initialLoading: false,
    error: "",
    loadData: mockLoadData,

    ...overrides
});

const renderPage = (initialEntry = "/users/42") => {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path="/users/:userId" element={<PublicUserPage />} />
            </Routes>
        </MemoryRouter>
    );
};

describe("PublicUserPage", () => {

    /* =============================
       TEST SETUP
    ============================= */

    beforeEach(() => {
        vi.clearAllMocks();

        mockHookState = createHookState();
    });

    /* =============================
       LOADING STATE
    ============================= */

    it("shows loading state while public user data is loading", () => {
        mockHookState = createHookState({
            initialLoading: true
        });

        renderPage();

        expect(screen.getByText("Loading public profile...")).toBeInTheDocument();
    });

    /* =============================
       PAGE RENDERING
    ============================= */

    it("renders public profile heading and subtitle", () => {
        renderPage();

        expect(screen.getByRole("heading", {
            level: 1,
            name: "Public Profile"
        })).toBeInTheDocument();

        expect(screen.getByText("View this user's public profile and events.")).toBeInTheDocument();
    });

    /* =============================
       PROFILE DISPLAY
    ============================= */

    it("renders public user profile information", () => {
        renderPage();

        expect(screen.getByRole("heading", {
            level: 2,
            name: "Sakura"
        })).toBeInTheDocument();

        expect(screen.getByAltText("Sakura avatar")).toHaveAttribute("src", "/uploads/avatars/sakura.png");

        expect(screen.getByText("17")).toBeInTheDocument();
        expect(screen.getByText("created events")).toBeInTheDocument();

        expect(screen.getByText("8")).toBeInTheDocument();
        expect(screen.getByText("joined events")).toBeInTheDocument();
    });

    /* =============================
       EVENT LISTING
    ============================= */

    it("renders public event section metadata", () => {
        renderPage();

        expect(screen.getByRole("heading", {
            level: 2,
            name: /created events/i
        })).toBeInTheDocument();

        expect(screen.getByText("Public events created by this user.")).toBeInTheDocument();
        expect(screen.getByText("(1)")).toBeInTheDocument();
    });

    it("renders visible public events", () => {
        renderPage();

        expect(screen.getByText("Created Event")).toBeInTheDocument();
    });

    it("renders empty state when active view has no events", () => {
        mockHookState = createHookState({
            visibleEvents: []
        });

        renderPage();

        expect(screen.getByText("No created events found.")).toBeInTheDocument();

        expect(screen.getByText(
            "Try browsing another public user event section."
        )).toBeInTheDocument();
    });

    /* =============================
       VIEW SWITCHING
    ============================= */

    it("changes public event view when clicking Joined tab", async () => {
        const user = userEvent.setup();

        renderPage();

        await user.click(screen.getByRole("tab", {
            name: /joined/i
        }));

        expect(mockSetActiveView).toHaveBeenCalledWith("joined");
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("renders accessible public profile sections", () => {
        renderPage();

        expect(
            screen.getByRole("heading", {
                level: 1,
                name: "Public Profile"
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                level: 2,
                name: "Sakura"
            })
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", {
                level: 2,
                name: /created events/i
            })
        ).toBeInTheDocument();
    });

    /* =============================
       ERROR STATE
    ============================= */

    it("renders error message when public user loading fails", () => {
        mockHookState = createHookState({
            error: "❌ Failed to load public user profile"
        });

        renderPage();

        expect(screen.getByText("❌ Failed to load public user profile")).toBeInTheDocument();
    });

    /* =============================
       HOOK INTEGRATION
    ============================= */

    it("loads public user data on mount", () => {
        renderPage();

        expect(mockLoadData).toHaveBeenCalledTimes(1);
    });

    it("initializes public user listing hook with route user id", () => {
        renderPage("/users/42");

        expect(usePublicUserListingData).toHaveBeenCalledWith("42");
    });
});
