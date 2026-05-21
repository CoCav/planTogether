/* ==================================================
   USER AVATAR
   Reusable user avatar display component

   Handles:
   - avatar image rendering
   - accessible avatar alternative text
   - fallback avatar display
   - forwarded image props
================================================== */

export default function UserAvatar({ src, name, className = "", ...props }) {

    /* =============================
       FALLBACK DATA
    ============================= */

    const avatarAlt = name ? `${name} avatar` : "User avatar";


    /* =============================
       MAIN RENDER
    ============================= */

    return (
        <img
            src={src}
            alt={avatarAlt}
            className={className}
            {...props}
        />
    );
}
