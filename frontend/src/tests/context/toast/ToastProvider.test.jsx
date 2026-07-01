import { useContext } from "react";
import { fireEvent, render, screen, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ToastProvider from "../../../context/toast/ToastProvider";
import ToastContext from "../../../context/toast/ToastContext";

/* ==================================================
   TOAST PROVIDER TESTS
   Tests global toast state and context actions

   Handles:
   - initial empty toast state
   - toast creation
   - toast removal
   - automatic toast dismissal
   - persistent toast duration
   - toast helper methods
   - toast id return value
   - maximum visible toast limit

   Notes:
   - uses a test consumer to access toast context
   - crypto.randomUUID is mocked for predictable toast ids
================================================== */

function TestComponent() {
    const {
        toasts,
        addToast,
        removeToast,
        info,
        success,
        warning,
        danger
    } = useContext(ToastContext);

    return (
        <div>
            <span data-testid="toast-count">
                {toasts.length}
            </span>

            <span data-testid="toast-messages">
                {toasts.map((toast) => toast.message).join(",")}
            </span>

            <span data-testid="toast-types">
                {toasts.map((toast) => toast.type).join(",")}
            </span>

            <button onClick={() => addToast({ message: "Added toast", duration: 0 })}>
                add
            </button>

            <button onClick={() => removeToast("toast-1")}>
                remove
            </button>

            <button onClick={() => info("Info toast", { duration: 0 })}>
                info
            </button>

            <button onClick={() => success("Success toast", { duration: 0 })}>
                success
            </button>

            <button onClick={() => success("Timed toast", { duration: 1000 })}>
                timed
            </button>

            <button onClick={() => warning("Warning toast", { duration: 0 })}>
                warning
            </button>

            <button onClick={() => danger("Danger toast", { duration: 0 })}>
                danger
            </button>
        </div>
    );
}

describe("ToastProvider", () => {

    /* =============================
       TEST HELPERS
    ============================= */

    const renderToastProvider = () => {
        return render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();

        let toastId = 0;

        vi.spyOn(crypto, "randomUUID")
            .mockImplementation(() => {
                toastId += 1;
                return `toast-${toastId}`;
            });
    });

    /* =============================
       INITIAL STATE
    ============================= */

    it("should initialize with no toasts", () => {
        renderToastProvider();

        expect(screen.getByTestId("toast-count")).toHaveTextContent("0");
        expect(screen.getByTestId("toast-messages")).toHaveTextContent("");
        expect(screen.getByTestId("toast-types")).toHaveTextContent("");
    });

    /* =============================
       TOAST CREATION
    ============================= */

    it("should add a toast", () => {
        renderToastProvider();

        fireEvent.click(screen.getByText("add"));

        expect(screen.getByTestId("toast-count")).toHaveTextContent("1");
        expect(screen.getByTestId("toast-messages")).toHaveTextContent("Added toast");
        expect(screen.getByTestId("toast-types")).toHaveTextContent("info");
    });

    it("should add multiple toasts", () => {
        renderToastProvider();

        fireEvent.click(screen.getByText("add"));
        fireEvent.click(screen.getByText("success"));

        expect(screen.getByTestId("toast-count")).toHaveTextContent("2");
        expect(screen.getByTestId("toast-messages")).toHaveTextContent("Added toast,Success toast");
        expect(screen.getByTestId("toast-types")).toHaveTextContent("info,success");
    });

    it("should keep only the latest visible toasts", () => {
        renderToastProvider();

        fireEvent.click(screen.getByRole("button", { name: "add" }));
        fireEvent.click(screen.getByRole("button", { name: "info" }));
        fireEvent.click(screen.getByRole("button", { name: "success" }));
        fireEvent.click(screen.getByRole("button", { name: "warning" }));
        fireEvent.click(screen.getByRole("button", { name: "danger" }));

        expect(screen.getByTestId("toast-count")).toHaveTextContent("4");

        expect(screen.getByTestId("toast-messages")).toHaveTextContent("Info toast,Success toast,Warning toast,Danger toast");
    });

    it("should return created toast id", () => {
        let createdToastId = null;

        function IdTestComponent() {
            const { addToast } = useContext(ToastContext);

            return (
                <button
                    onClick={() => {
                        createdToastId = addToast({
                            message: "Added toast",
                            duration: 0
                        });
                    }}
                >
                    add
                </button>
            );
        }

        render(
            <ToastProvider>
                <IdTestComponent />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText("add"));

        expect(createdToastId).toBe("toast-1");
    });

    /* =============================
       TOAST REMOVAL
    ============================= */

    it("should remove a toast", () => {
        renderToastProvider();

        fireEvent.click(screen.getByText("add"));
        fireEvent.click(screen.getByText("remove"));

        expect(screen.getByTestId("toast-count")).toHaveTextContent("0");
    });

    /* =============================
       AUTO DISMISSAL
    ============================= */

    it("should automatically remove toast after duration", async () => {
        vi.useFakeTimers();

        try {
            renderToastProvider();

            fireEvent.click(screen.getByText("timed"));

            expect(screen.getByTestId("toast-count")).toHaveTextContent("1");

            await act(async () => {
                await vi.advanceTimersByTimeAsync(1000);
            });

            expect(screen.getByTestId("toast-count")).toHaveTextContent("0");
        } finally {
            vi.useRealTimers();
        }
    });

    it("should keep toast when duration is zero", () => {
        vi.useFakeTimers();

        renderToastProvider();

        fireEvent.click(screen.getByText("add"));

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(screen.getByTestId("toast-count")).toHaveTextContent("1");
    });

    /* =============================
       HELPER METHODS
    ============================= */

    it("should add info toast", () => {
        renderToastProvider();

        fireEvent.click(screen.getByText("info"));

        expect(screen.getByTestId("toast-messages")).toHaveTextContent("Info toast");
        expect(screen.getByTestId("toast-types")).toHaveTextContent("info");
    });

    it("should add success toast", () => {
        renderToastProvider();

        fireEvent.click(screen.getByText("success"));

        expect(screen.getByTestId("toast-messages")).toHaveTextContent("Success toast");
        expect(screen.getByTestId("toast-types")).toHaveTextContent("success");
    });

    it("should add warning toast", () => {
        renderToastProvider();

        fireEvent.click(screen.getByText("warning"));

        expect(screen.getByTestId("toast-messages")).toHaveTextContent("Warning toast");
        expect(screen.getByTestId("toast-types")).toHaveTextContent("warning");
    });

    it("should add danger toast", () => {
        renderToastProvider();

        fireEvent.click(screen.getByText("danger"));

        expect(screen.getByTestId("toast-messages")).toHaveTextContent("Danger toast");
        expect(screen.getByTestId("toast-types")).toHaveTextContent("danger");
    });
});
