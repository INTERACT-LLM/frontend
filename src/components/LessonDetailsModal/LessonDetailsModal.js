"use client";

import React, { useEffect, useState } from "react";
import styles from "./LessonDetailsModal.module.css";

const TABS = ["Overview", "Under the hood"];

function PromptBlock({ label, content, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.promptBlock}>
      <button
        className={styles.promptToggle}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className={styles.promptLabel}>{label}</span>
        <span className={`${styles.promptChevron} ${open ? styles.open : ""}`}>▾</span>
      </button>
      {open && (
        <pre className={styles.promptPre}>{content}</pre>
      )}
    </div>
  );
}

export default function LessonDetailsModal({ lesson, prompts, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const p = lesson?.lesson_presentation;
  const feedback = lesson?.lesson_feedback;

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!lesson) return null;

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div className={styles.header}>
          <div>
            <div className={styles.eyebrow}>Lesson details</div>
            <h2 className={styles.title}>{p?.ui_title}</h2>
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className={styles.tabs} role="tablist">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === i}
              className={`${styles.tab} ${activeTab === i ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={styles.body}>

          {activeTab === 0 && (
            <div className={styles.overview}>
              {p?.ui_long_description && (
                <p className={styles.scene}>{p.ui_long_description.trim()}</p>
              )}
              {p?.ui_goals?.length > 0 && (
                <div className={styles.goals}>
                  <span className={styles.goalsLabel}>Your goals</span>
                  <ol className={styles.goalsList}>
                    {p.ui_goals.map((g, i) => <li key={i}>{g}</li>)}
                  </ol>
                </div>
              )}
              {feedback?.feedback_focus && (
                <div className={styles.focusBlock}>
                  <span className={styles.focusLabel}>Feedback focus</span>
                  <span className={styles.focusValue}>{feedback.feedback_focus}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 1 && (
            <div className={styles.transparency}>
              <p className={styles.transparencyNote}>
                This is exactly what the AI receives before your conversation starts.
              </p>
              {!prompts && (
                <div className={styles.loadingState}>Loading prompts…</div>
              )}
              {prompts && (
                <>
                  <PromptBlock
                    label="Chat system prompt"
                    content={prompts.chat_system_prompt}
                  />
                  <PromptBlock
                    label="Feedback system prompt"
                    content={prompts.immediate_feedback_prompt}
                  />
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}