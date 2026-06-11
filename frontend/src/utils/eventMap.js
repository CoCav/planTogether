import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* ==================================================
   EVENT MAP UTILS
   Provides Leaflet setup helpers

   Handles:
   - default marker icon URL resolution with Vite
   - retina marker icon support
   - marker shadow asset support
================================================== */

/* =============================
   ICON SETUP
============================= */

// Configures Leaflet default marker icons
export const setupLeafletIcons = () => {
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x,
        iconUrl: markerIcon,
        shadowUrl: markerShadow
    });
};
