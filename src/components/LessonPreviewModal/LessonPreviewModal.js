"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./LessonPreviewModal.module.css";

function parseDescription(text) {
  if (!text) return [];

  return text
    .trim()
    .split(/\n\s*\n/)
    .map((para) =>
      para
        .trim()
        .replace(/\s+/g, " ")
        .match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)
        ?.map((s) => s.trim())
        .filter(Boolean) ?? []
    )
    .filter((para) => para.length > 0);
}

export default function LessonModal({ lesson, onClose }) {
  const router = useRouter();
  const [tutorStarts, setTutorStarts] = React.useState(false);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!lesson) return null;

  const handleStart = () => {
    onClose();
    const query = tutorStarts ? "?tutor_starts=true" : "";
    router.push(`/lessons/${lesson.id}${query}`);
  };

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className={styles.eyebrow}>Lesson preview</div>
        <h2 className={styles.title}>{lesson.ui_title}</h2>

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
          <div className={styles.goals}>
            <span className={styles.goalsLabel}>Your goals</span>
            <ol className={styles.goalsList}>
              {lesson.ui_goals.map((g, i) => (
                <li key={i}>{g}</li>
              ))}
            </ol>
          </div>
        )}

        {lesson.feedback_focus && (
          <div className={styles.focusBlock}>
            <span className={styles.focusLabel}>Today's feedback focus</span>
            <span className={styles.focusValue}>{lesson.feedback_focus}</span>
          </div>
        )}

        <div className={styles.actions}>
          {/* Tutor starts toggle */}
          <div className={styles.tutorToggle}>
            <span className={styles.tutorToggleLabel}>
              {tutorStarts ? "Tutor starts" : "You start"}
            </span>
            <button
              role="switch"
              aria-checked={tutorStarts}
              className={`${styles.toggle} ${tutorStarts ? styles.toggleOn : ""}`}
              onClick={() => setTutorStarts((prev) => !prev)}
            />
          </div>

          <div className={styles.buttons}>
            <button className={styles.btnGhost} onClick={onClose}>
              Not now
            </button>
            <button className={styles.btnPrimary} onClick={handleStart}>
              Start lesson →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}