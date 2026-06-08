"use client";
import React from "react";
import { useUser } from "@/context/UserContext";
import styles from "./LogoutButton.module.css";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";

export default function LogoutButton({ className, onLogout }) {
  const { clearUser } = useUser();
  const [isConfirming, setIsConfirming] = React.useState(false);

  function handleClick() {
    if (onLogout) onLogout(); // close parent UI (dropdown, modal, etc.)
    setIsConfirming(true);
  }

  function handleConfirm() {
    setIsConfirming(false);
    clearUser();
  }

  return (
    <>
      <button onClick={handleClick} className={className}>
        Log out
      </button>

      {isConfirming && (
        <ConfirmModal
          title="WARNING"
          message={
              <>
                Logging out will delete your locally saved profile, including your name, preferences, and language settings.
                <br /><br />
                <span className={styles.warning}>This cannot be undone.</span>
              </>
          }
          confirmLabel="Log out"
          cancelLabel="Cancel"
          destructive
          onConfirm={handleConfirm}
          onCancel={() => setIsConfirming(false)}
        />
      )}
    </>
  );
}