// WHAT SITS IN THE HEADER WHEN YOU'RE LOGGED IN, SHOWING YOUR INITIALS AND A DROPDOWN WITH OPTIONS
import React from "react";
import styles from "./UserAvatar.module.css";
import LogoutButton from "@/components/LogoutButton/LogoutButton";

function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function UserAvatar({ user, onEditRequest, disabled = false }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className={styles.wrapper}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
        className={styles.avatar}
      >
        {initials(user.name)}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <p className={styles.dropdownName}>{user.name}</p>
          <p className={styles.dropdownMeta}>
            Learning {user.learningLanguage} · {user.proficiency_level}
          </p>
          <div className={styles.dropdownDivider} />
          <button
            className={styles.dropdownEdit}
            onClick={
              disabled
                ? undefined
                : () => {
                    setOpen(false);
                    onEditRequest();
                  }
            }
            disabled={disabled}
          >
            {disabled ? "Cannot edit during lesson" : "Edit preferences"}
          </button>
        {!disabled && (
          <LogoutButton className={styles.dropdownLogout} />
        )}
        </div>
      )}
    </div>
  );
}