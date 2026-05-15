import { beforeEach, describe, expect, it, vi } from "vitest";

/* ==================================================
   API CLIENT TESTS
   Tests centralized Axios client configuration

   Handles:
   - JWT authorization header injection
   - missing token behavior
   - missing headers object behavior
================================================== */

const mockGetToken = vi.fn();

vi.mock("../../features/auth/authToken.js", () => ({
    getToken: () => mockGetToken()
}));

describe("apiClient", () => {

    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    /* =============================
       TEST HELPERS
    ============================= */

    const getRequestInterceptor = async () => {
        const apiClient = (await import("../../api/apiClient")).default;

        return apiClient.interceptors.request.handlers[0].fulfilled;
    };

    /* =============================
       AUTHORIZATION HEADER
    ============================= */

    it("should attach Authorization header when token exists", async () => {
        mockGetToken.mockReturnValue("fake-token");

        const interceptor = await getRequestInterceptor();

        const config = interceptor({
            headers: {}
        });

        expect(config.headers.Authorization).toBe("Bearer fake-token");
    });

    it("should not attach Authorization header when token is missing", async () => {
        mockGetToken.mockReturnValue(null);

        const interceptor = await getRequestInterceptor();

        const config = interceptor({
            headers: {}
        });

        expect(config.headers.Authorization).toBeUndefined();
    });

    it("should create headers object when token exists and headers are missing", async () => {
        mockGetToken.mockReturnValue("fake-token");

        const interceptor = await getRequestInterceptor();

        const config = interceptor({});

        expect(config.headers.Authorization).toBe("Bearer fake-token");
    });
});
