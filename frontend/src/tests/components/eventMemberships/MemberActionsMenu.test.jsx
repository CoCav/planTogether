import { ChevronDown, Crown, UserX } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import MemberActionsMenu from "../../../components/eventMemberships/MemberActionsMenu";

/* ==================================================
   MEMBER ACTIONS MENU TESTS
   Tests compact membership management dropdown

   Handles:
   - menu trigger rendering
   - accessible trigger state
   - dropdown open and close behavior
   - visible action filtering
   - dynamic action rendering
   - action callback execution
   - menu close after action click
   - outside click closing
   - danger action styling
   - separated action styling
   - accessible menu semantics

   Notes:
   - uses reusable render helper
   - uses real outside click behavior
================================================== */

describe("MemberActionsMenu", () => {

    /* =============================
       TEST DATA
    ============================= */

    const transferAction = {
        label: "Transfer ownership",
        icon: Crown,
        show: true,
        onClick: vi.fn()
    };

    const removeAction = {
        label: "Remove from event",
        icon: UserX,
        show: true,
        danger: true,
        separated: true,
        onClick: vi.fn()
    };

    const hiddenAction = {
        label: "Hidden action",
        icon: ChevronDown,
        show: false,
        onClick: vi.fn()
    };

    /* =============================
       TEST HELPERS
    ============================= */

    const renderMemberActionsMenu = (actions = []) => {
        return render(
            <MemberActionsMenu actions={actions} />
        );
    };

    /* =============================
       VISIBILITY
    ============================= */

    it("should not render menu when there are no visible actions", () => {
        renderMemberActionsMenu([hiddenAction]);

        expect(screen.queryByRole("button", {
            name: "Manage"
        })).not.toBeInTheDocument();
    });

    it("should render menu trigger when visible actions exist", () => {
        renderMemberActionsMenu([transferAction]);

        expect(screen.getByRole("button", {
            name: "Manage"
        })).toBeInTheDocument();
    });

    /* =============================
       ACCESSIBILITY
    ============================= */

    it("should render accessible trigger attributes", () => {
        renderMemberActionsMenu([transferAction]);

        const trigger = screen.getByRole("button", {
            name: "Manage"
        });

        expect(trigger).toHaveAttribute("aria-haspopup", "menu");
        expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    it("should associate trigger with dropdown when menu is open", async () => {
        const user = userEvent.setup();

        renderMemberActionsMenu([transferAction]);

        const trigger = screen.getByRole("button", {
            name: "Manage"
        });

        expect(trigger).not.toHaveAttribute("aria-controls");

        await user.click(trigger);

        const menu = screen.getByRole("menu");

        expect(trigger).toHaveAttribute("aria-controls", menu.id);
    });

    it("should render dropdown as accessible menu", async () => {
        const user = userEvent.setup();

        renderMemberActionsMenu([
            transferAction,
            removeAction
        ]);

        await user.click(screen.getByRole("button", {
            name: "Manage"
        }));

        expect(screen.getByRole("menu")).toBeInTheDocument();

        expect(screen.getAllByRole("menuitem")).toHaveLength(2);
    });

    /* =============================
       DROPDOWN STATE
    ============================= */

    it("should open and close dropdown when clicking trigger", async () => {
        const user = userEvent.setup();

        renderMemberActionsMenu([transferAction]);

        const trigger = screen.getByRole("button", {
            name: "Manage"
        });

        expect(trigger).toHaveAttribute("aria-expanded", "false");

        await user.click(trigger);

        expect(trigger).toHaveAttribute("aria-expanded", "true");

        expect(screen.getByRole("menu")).toBeInTheDocument();

        await user.click(trigger);

        expect(trigger).toHaveAttribute("aria-expanded", "false");

        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("should close dropdown when clicking outside", async () => {
        const user = userEvent.setup();

        renderMemberActionsMenu([transferAction]);

        await user.click(screen.getByRole("button", {
            name: "Manage"
        }));

        expect(screen.getByRole("menu")).toBeInTheDocument();

        await user.click(document.body);

        await waitFor(() => {
            expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        });
    });

    /* =============================
       ACTIONS
    ============================= */

    it("should render only visible actions", async () => {
        const user = userEvent.setup();

        renderMemberActionsMenu([
            transferAction,
            removeAction,
            hiddenAction
        ]);

        await user.click(screen.getByRole("button", {
            name: "Manage"
        }));

        expect(screen.getByRole("menuitem", {
            name: "Transfer ownership"
        })).toBeInTheDocument();

        expect(screen.getByRole("menuitem", {
            name: "Remove from event"
        })).toBeInTheDocument();

        expect(screen.queryByRole("menuitem", {
            name: "Hidden action"
        })).not.toBeInTheDocument();
    });

    it("should hide actions without explicit show value", () => {
        renderMemberActionsMenu([
            {
                label: "Implicit action",
                onClick: vi.fn()
            }
        ]);

        expect(screen.queryByRole("button", {
            name: "Manage"
        })).not.toBeInTheDocument();
    });

    it("should render action without icon", async () => {
        const user = userEvent.setup();

        renderMemberActionsMenu([
            {
                label: "Custom action",
                show: true,
                onClick: vi.fn()
            }
        ]);

        await user.click(screen.getByRole("button", { name: "Manage" }));

        expect(screen.getByRole("menuitem", {
            name: "Custom action"
        })).toBeInTheDocument();
    });

    it("should call action callback when clicking action", async () => {
        const user = userEvent.setup();

        const onClick = vi.fn();

        renderMemberActionsMenu([
            {
                label: "Transfer ownership",
                show: true,
                onClick
            }
        ]);

        await user.click(screen.getByRole("button", {
            name: "Manage"
        }));

        await user.click(screen.getByRole("menuitem", {
            name: "Transfer ownership"
        }));

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("should close dropdown after clicking action", async () => {
        const user = userEvent.setup();

        renderMemberActionsMenu([transferAction]);

        await user.click(screen.getByRole("button", {
            name: "Manage"
        }));

        await user.click(screen.getByRole("menuitem", {
            name: "Transfer ownership"
        }));

        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    /* =============================
       ACTION STYLING
    ============================= */

    it("should apply danger styling to danger actions", async () => {
        const user = userEvent.setup();

        renderMemberActionsMenu([removeAction]);

        await user.click(screen.getByRole("button", {
            name: "Manage"
        }));

        expect(screen.getByRole("menuitem", {
            name: "Remove from event"
        })).toHaveClass("member-actions-dropdown-item-danger");
    });

    it("should apply separated styling to separated actions", async () => {
        const user = userEvent.setup();

        renderMemberActionsMenu([removeAction]);

        await user.click(screen.getByRole("button", {
            name: "Manage"
        }));

        expect(screen.getByRole("menuitem", {
            name: "Remove from event"
        })).toHaveClass("member-actions-dropdown-item-separated");
    });
});
