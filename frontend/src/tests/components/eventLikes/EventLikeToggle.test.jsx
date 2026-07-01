import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EventLikeToggle from "../../../components/eventLikes/EventLikeToggle";

import useEventLike from "../../../features/eventLikes/hooks/useEventLike";

/* ==================================================
   EVENT LIKE TOGGLE TESTS
   Tests event like toggle rendering

   Handles:
   - hook integration
   - authenticated rendering
   - guest rendering
   - like state forwarding
   - toggle callback forwarding
   - guest login prompt callback

   Notes:
   - useEventLike is mocked
   - EventLikeButton is rendered normally
   - business logic is tested separately
================================================== */

vi.mock("../../../features/eventLikes/hooks/useEventLike");

describe("EventLikeToggle", () => {

    /* =============================
       TEST DATA
    ============================= */

    const handleToggleLike = vi.fn();

    const baseProps = {
        eventId: 1,
        user: {
            userId: 10
        },
        liked: false,
        likesCount: 0,
        toast: {
            info: vi.fn(),
            success: vi.fn(),
            danger: vi.fn()
        },
        onLikeChange: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();

        useEventLike.mockReturnValue({
            likeState: {
                liked: false,
                likesCount: 0,
                isTogglingLike: false
            },

            likeActions: {
                handleToggleLike
            }
        });
    });

    /* =============================
       TEST HELPERS
    ============================= */

    const renderEventLikeToggle = (props = {}) => {
        return render(
            <EventLikeToggle
                {...baseProps}
                {...props}
            />
        );
    };

    /* =============================
       AUTHENTICATED USER
    ============================= */

    it("should initialize useEventLike with event like props", () => {
        renderEventLikeToggle({
            eventId: 7,
            liked: true,
            likesCount: 5
        });

        expect(useEventLike).toHaveBeenCalledWith({
            eventId: 7,
            initialLiked: true,
            initialLikesCount: 5,
            toast: baseProps.toast,
            onLikeChange: baseProps.onLikeChange
        });
    });

    it("should render authenticated like state from hook", () => {
        useEventLike.mockReturnValue({
            likeState: {
                liked: true,
                likesCount: 8,
                isTogglingLike: false
            },

            likeActions: {
                handleToggleLike
            }
        });

        renderEventLikeToggle();

        expect(screen.getByRole("button", {
            name: /unlike event\. 8 likes/i
        })).toBeInTheDocument();
    });

    it("should call hook toggle callback for authenticated user", () => {
        renderEventLikeToggle({
            liked: false,
            likesCount: 1
        });

        fireEvent.click(screen.getByRole("button", {
            name: /like event\. 0 likes/i
        }));

        expect(handleToggleLike).toHaveBeenCalledTimes(1);
    });

    it("should disable authenticated button while toggling", () => {
        useEventLike.mockReturnValue({
            likeState: {
                liked: false,
                likesCount: 2,
                isTogglingLike: true
            },

            likeActions: {
                handleToggleLike
            }
        });

        renderEventLikeToggle();

        expect(screen.getByRole("button")).toBeDisabled();
    });

    /* =============================
       GUEST USER
    ============================= */

    it("should render guest like button with initial like count", () => {
        renderEventLikeToggle({
            user: null,
            likesCount: 6
        });

        expect(screen.getByRole("button", {
            name: /like event\. 6 likes/i
        })).toBeInTheDocument();
    });

    it("should show login prompt when guest clicks like button", () => {
        const toast = {
            info: vi.fn()
        };

        renderEventLikeToggle({
            user: null,
            likesCount: 6,
            toast
        });

        fireEvent.click(screen.getByRole("button", {
            name: /like event\. 6 likes/i
        }));

        expect(toast.info).toHaveBeenCalledWith("Login to like events.");
        expect(handleToggleLike).not.toHaveBeenCalled();
    });
});
