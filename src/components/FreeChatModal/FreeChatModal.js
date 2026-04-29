"use client";

import React from "react";
import styles from "./FreeChatModal.module.css";

export default function FreeChatModal({ systemPrompt, onClose }) {
  React.useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div className={styles.header}>
          <div>
            <div className={styles.eyebrow}>About this chat</div>
            <h2 className={styles.title}>Free conversation</h2>
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.body}>
          <p className={styles.description}>
            This is an open-ended conversation with no lesson or scenario. Just talk freely — your tutor will follow your lead and adapt to your level.
          </p>

          <div className={styles.promptSection}>
            <span className={styles.promptLabel}>System prompt</span>
            <p className={styles.transparencyNote}>
              This is exactly what the AI receives before your conversation starts.
            </p>
            {systemPrompt
              ? <pre className={styles.promptPre}>{systemPrompt}</pre>
              : <div className={styles.loadingState}>Loading…</div>
            }
          </div>
        </div>

      </div>
    </div>
  );
}