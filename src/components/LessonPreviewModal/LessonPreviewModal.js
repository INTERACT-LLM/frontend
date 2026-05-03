"use client";

import React from "react";
import { useRouter } from "next/navigation";
import BaseModal from "@/components/BaseModal/BaseModal";
import TutorStartsFooter from "@/components/TutorStartsFooter/TutorStartsFooter";
import styles from "./LessonPreviewModal.module.css";

function parseDescription(text) {
  if (!text) return [];
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((para) =>
      para.trim().replace(/\s+/g, " ")
        .match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)
        ?.map((s) => s.trim()).filter(Boolean) ?? []
    )
    .filter((para) => para.length > 0);
}

const ACCENT_CLASS = {
  roleplay: styles.accentRoleplay,
  game:     styles.accentGame,
};

export default function LessonPreviewModal({ lesson, onClose }) {
  const router = useRouter();

  if (!lesson) return null;

  const accentClass = ACCENT_CLASS[lesson.lesson_type] ?? "";

  const handleStart = (tutorStarts) => {
    onClose();
    const query = tutorStarts ? "?tutor_starts=true" : "";
    router.push(`/lessons/${lesson.id}${query}`);
  };

  return (
    <BaseModal
      eyebrow="Lesson preview"
      title={lesson.ui_title}
      onClose={onClose}
      className={styles.modal}
      footer={
        <TutorStartsFooter
          onClose={onClose}
          onStart={handleStart}
          startLabel="Start lesson →"
        />
      }
    >
      {lesson.ui_long_description && (
        <div className={styles.descriptionBlock}>
          {parseDescription(lesson.ui_long_description).map((para, pi) => (
            <p key={pi} className={styles.descriptionPara}>
              {para.map((sentence, si) => (
                <React.Fragment key={si}>
                  {sentence}
                  {si < para.length - 1 && <br />}
                </React.Fragment>
              ))}
            </p>
          ))}
        </div>
      )}

      {lesson.ui_goals?.length > 0 && (
        <div className={`${styles.goals} ${accentClass}`}>
          <span className={styles.goalsLabel}>Your goals</span>
          <ol className={styles.goalsList}>
            {lesson.ui_goals.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ol>
        </div>
      )}

      {lesson.feedback_focus && (
        <div className={`${styles.focusBlock} ${accentClass}`}>
          <span className={styles.focusLabel}>Today's feedback focus</span>
          <span className={styles.focusValue}>{lesson.feedback_focus}</span>
        </div>
      )}
    </BaseModal>
  );
}