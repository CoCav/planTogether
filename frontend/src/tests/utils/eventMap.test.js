import { describe, expect, it, vi } from "vitest";
import L from "leaflet";

import { setupLeafletIcons } from "../../utils/eventMap";

/* ==================================================
   EVENT MAP UTILS TESTS
   Tests Leaflet map utility helpers

   Handles:
   - default marker icon configuration
   - retina marker icon configuration
   - marker shadow configuration

   Notes:
   - verifies Leaflet default icon setup
   - prevents broken marker icons in Vite builds
================================================== */

describe("eventMapUtils", () => {

    /* =============================
       ICON SETUP
    ============================= */

    it("should configure Leaflet default marker icons", () => {
        const mergeOptionsSpy = vi.spyOn(
            L.Icon.Default,
            "mergeOptions"
        );

        setupLeafletIcons();

        expect(mergeOptionsSpy).toHaveBeenCalledTimes(1);

        expect(mergeOptionsSpy).toHaveBeenCalledWith({
            iconRetinaUrl: expect.any(String),
            iconUrl: expect.any(String),
            shadowUrl: expect.any(String)
        });
    });
});
