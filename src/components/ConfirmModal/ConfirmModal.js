"use client";
import React from "react";
import styles from "./ConfirmModal.module.css";

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  destructive = false,
}) {
  // close on Escape
  React.useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <h2 id="confirm-title" className={styles.title}>{title}</h2>
       <div className={styles.message}>{message}</div>
        <div className={styles.actions}>
          <button onClick={onCancel} className={styles.cancel}>
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={destructive ? styles.confirmDestructive : styles.confirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}