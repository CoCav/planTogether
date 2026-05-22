import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useEventDetailsData from "../../../../../features/events/hooks/eventDetails/useEventDetailsData";

import { getEventById } from "../../../../../api/events/eventApi";

import {
    getEventMembers,
    getEventStaff
} from "../../../../../api/eventMemberships/eventMembershipApi";

import { getNormalizedEvent } from "../../../../../features/events/eventNormalizer";

import {
    getNormalizedEventStaff,
    getNormalizedMembers
} from "../../../../../features/eventMemberships/eventMembershipNormalizer";

/* ==================================================
   USE EVENT DETAILS DATA TESTS
   Tests event details data loading and normalization

   Handles:
   - initial state
   - event details loading
   - staff loading
   - participant loading
   - response normalization
   - loading state updates
   - error handling

   Notes:
   - mocks API modules
   - mocks normalizers
================================================== */

/* =============================
   MOCKS
============================= */

vi.mock("../../../../../api/events/eventApi", () => ({
    getEventById: vi.fn()
}));

vi.mock("../../../../../api/eventMemberships/eventMembershipApi", () => ({
    getEventMembers: vi.fn(),
    getEventStaff: vi.fn()
}));

vi.mock("../../../../../features/events/eventNormalizer", () => ({
    getNormalizedEvent: vi.fn()
}));

vi.mock("../../../../../features/eventMemberships/eventMembershipNormalizer", () => ({
    getNormalizedEventStaff: vi.fn(),
    getNormalizedMembers: vi.fn()
}));

describe("useEventDetailsData", () => {

    /* =============================
       TEST DATA
    ============================= */

    const mockEvent = {
        id: 1,
        title: "React Meetup"
    };

    const mockStaff = [
        {
            id: 10,
            name: "John"
        }
    ];

    const mockMembers = [
        {
            id: 20,
            name: "Alice"
        }
    ];

    /* =============================
       TEST HELPERS
    ============================= */

    const renderUseEventDetailsData = () => {
        return renderHook(() =>
            useEventDetailsData({
                eventId: 1,
                setError,
                setLoading
            })
        );
    };

    /* =============================
       TEST SETUP
    ============================= */

    let setError;
    let setLoading;

    beforeEach(() => {
        vi.clearAllMocks();

        setError = vi.fn();
        setLoading = vi.fn();

        getEventById.mockResolvedValue({
            event: mockEvent
        });

        getEventStaff.mockResolvedValue({
            eventStaff: mockStaff
        });

        getEventMembers.mockResolvedValue({
            members: mockMembers
        });

        getNormalizedEvent.mockReturnValue(mockEvent);

        getNormalizedEventStaff.mockReturnValue(mockStaff);
        getNormalizedMembers.mockReturnValue(mockMembers);
    });

    /* =============================
       INITIAL STATE
    ============================= */

    it("initializes empty event details state", () => {
        const { result } = renderUseEventDetailsData();

        expect(result.current.event).toBeNull();

        expect(result.current.staff).toEqual([]);
        expect(result.current.members).toEqual([]);
    });

    /* =============================
       DATA LOADING
    ============================= */

    it("loads and normalizes event details data", async () => {
        const { result } = renderUseEventDetailsData();

        await act(async () => {
            await result.current.loadData();
        });

        expect(getEventById).toHaveBeenCalledWith(1);

        expect(getEventStaff).toHaveBeenCalledWith(1);
        expect(getEventMembers).toHaveBeenCalledWith(1);

        expect(getNormalizedEvent).toHaveBeenCalled();

        expect(getNormalizedEventStaff).toHaveBeenCalled();
        expect(getNormalizedMembers).toHaveBeenCalled();

        expect(result.current.event).toEqual(mockEvent);

        expect(result.current.staff).toEqual(mockStaff);
        expect(result.current.members).toEqual(mockMembers);
    });

    /* =============================
       LOADING STATE
    ============================= */

    it("updates loading state during data loading", async () => {
        const { result } = renderUseEventDetailsData();

        await act(async () => {
            await result.current.loadData();
        });

        expect(setLoading).toHaveBeenCalledWith(true);

        expect(setLoading).toHaveBeenCalledWith(false);
    });

    /* =============================
       ERROR HANDLING
    ============================= */

    it("sets error state when event loading fails", async () => {
        getEventById.mockRejectedValue(
            new Error("API error")
        );

        const { result } = renderUseEventDetailsData();

        await act(async () => {
            await result.current.loadData();
        });

        expect(setError).toHaveBeenCalledWith("");

        expect(setError).toHaveBeenCalledWith("❌ Failed to load event details");

        expect(setLoading).toHaveBeenCalledWith(false);
    });
});
