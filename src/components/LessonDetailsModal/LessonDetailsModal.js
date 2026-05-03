"use client";

import React from "react";
import BaseModal from "@/components/BaseModal/BaseModal";
import PromptBlock from "@/components/PromptBlock/PromptBlock";
import styles from "./LessonDetailsModal.module.css";

const TABS = ["Overview", "Under the hood"];

export default function LessonDetailsModal({ lesson, prompts, onClose }) {
  const [activeTab, setActiveTab] = React.useState(0);
  const p = lesson?.lesson_presentation;
  const feedback = lesson?.lesson_feedback;

  if (!lesson) return null;

  return (
    <BaseModal
      eyebrow="Lesson details"
      title={p?.ui_title}
      onClose={onClose}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      className={styles.modal}
    >
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
          {!prompts
            ? <div className={styles.loadingState}>Loading prompts…</div>
            : <>
                <PromptBlock label="Chat system prompt" content={prompts.chat_system_prompt} />
                <PromptBlock label="Feedback system prompt" content={prompts.immediate_feedback_prompt} />
              </>
          }
        </div>
      )}
    </BaseModal>
  );
}