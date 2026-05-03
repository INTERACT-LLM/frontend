"use client";

import React from "react";
import styles from "./BaseModal.module.css";

export default function BaseModal({
  eyebrow,
  title,
  onClose,
  tabs,
  activeTab,
  onTabChange,
  footer,
  className,
  children,
}) {
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
      <div className={`${styles.modal} ${className ?? ""}`} onClick={(e) => e.stopPropagation()}>

        <div className={styles.header}>
          <div>
            {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
            <h2 className={styles.title}>{title}</h2>
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {tabs && (
          <div className={styles.tabs} role="tablist">
            {tabs.map((tab, i) => (
              <button
                key={tab}
                role="tab"
                aria-selected={activeTab === i}
                className={`${styles.tab} ${activeTab === i ? styles.tabActive : ""}`}
                onClick={() => onTabChange(i)}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        <div className={styles.body}>
          {children}
        </div>

        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}

      </div>
    </div>
  );
}