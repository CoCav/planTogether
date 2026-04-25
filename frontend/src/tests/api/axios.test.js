import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetToken = vi.fn();

vi.mock("../../features/auth/token", () => ({
    getToken: () => mockGetToken()
}));

describe("axios instance", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    it("should attach Authorization header when token exists", async () => {
        mockGetToken.mockReturnValue("fake-token");

        const api = (await import("../../api/axios")).default;

        const interceptor = api.interceptors.request.handlers[0].fulfilled;

        const config = interceptor({
            headers: {}
        });

        expect(config.headers.Authorization).toBe("Bearer fake-token");
    });

    it("should not attach Authorization header when token does not exist", async () => {
        mockGetToken.mockReturnValue(null);

        const api = (await import("../../api/axios")).default;

        const interceptor = api.interceptors.request.handlers[0].fulfilled;

        const config = interceptor({
            headers: {}
        });

        expect(config.headers.Authorization).toBeUndefined();
    });

    it("should create headers object when token exists and headers are missing", async () => {
        mockGetToken.mockReturnValue("fake-token");

        const api = (await import("../../api/axios")).default;

        const interceptor = api.interceptors.request.handlers[0].fulfilled;

        const config = interceptor({});

        expect(config.headers.Authorization).toBe("Bearer fake-token");
    });
});