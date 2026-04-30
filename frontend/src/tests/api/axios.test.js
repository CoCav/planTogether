import { beforeEach, describe, expect, it, vi } from "vitest";

/* ==================================================
   AXIOS INSTANCE TESTS
   Tests JWT authorization header injection
================================================== */

const mockGetToken = vi.fn();

vi.mock("../../features/auth/token", () => ({
    getToken: () => mockGetToken(),
}));

describe("axios instance", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    const getRequestInterceptor = async () => {
        const api = (await import("../../api/axios")).default;

        return api.interceptors.request.handlers[0].fulfilled;
    };

    it("attaches Authorization header when token exists", async () => {
        mockGetToken.mockReturnValue("fake-token");

        const interceptor = await getRequestInterceptor();

        const config = interceptor({
            headers: {}
        });

        expect(config.headers.Authorization).toBe("Bearer fake-token");
    });

    it("does not attach Authorization header when token is missing", async () => {
        mockGetToken.mockReturnValue(null);

        const interceptor = await getRequestInterceptor();

        const config = interceptor({
            headers: {}
        });

        expect(config.headers.Authorization).toBeUndefined();
    });

    it("creates headers object when token exists and headers are missing", async () => {
        mockGetToken.mockReturnValue("fake-token");

        const interceptor = await getRequestInterceptor();

        const config = interceptor({});

        expect(config.headers.Authorization).toBe("Bearer fake-token");
    });
});
