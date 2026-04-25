"use client";

import React, { useState } from "react";
import useSWR from "swr";
import Card from "@/components/Card/Card";
import LessonModal from "@/components/LessonModal/LessonModal";
import styles from "./LessonGrid.module.css";

const LESSONS_ENDPOINT = '/api/lessons';

const UPCOMING = [
  { id: "u1", ui_title: "🍊 At the market", ui_short_description: "Practise numbers, food vocab and haggling." },
  { id: "u2", ui_title: "🗺️ Giving directions", ui_short_description: "Navigate streets and landmarks in Spanish." },
  { id: "u3", ui_title: "📅 Making plans", ui_short_description: "Suggest, accept and decline invitations." },
  { id: "u4", ui_title: "🏡 Talking about family", ui_short_description: "Describe people and relationships." },
];

const LESSON_TYPE_LABELS = {
  roleplay: "Roleplay",
  vocabulary_game: "Game",
};

async function fetcher(url) {
  const res = await fetch(url);
  return res.json();
}

export default function LessonGrid() {
  const { data, isLoading, error } = useSWR(LESSONS_ENDPOINT, fetcher);
  const [selectedLesson, setSelectedLesson] = useState(null);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading lessons.</div>;

  const roleplays = data?.lessons.filter((l) => l.lesson_type === "roleplay") ?? [];
  const games = data?.lessons.filter((l) => l.lesson_type === "vocabulary_game") ?? [];

  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <h1 className={styles.introTitle}>Ready to learn, Mina?</h1>
        <p className={styles.introSub}>Tap on any available lesson to get started.</p>
      </div>

      {roleplays.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionLabel}><span>Roleplays</span></div>
          <div className={styles.grid}>
            {roleplays.map((lesson) => (
              <Card
                key={lesson.id}
                onClick={() => setSelectedLesson(lesson)}
                title={lesson.ui_title}
                description={lesson.ui_short_description}
                badge={LESSON_TYPE_LABELS[lesson.lesson_type]}
                badgeVariant="roleplay"
              />
            ))}
          </div>
        </section>
      )}

      {games.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionLabel}><span>Vocabulary games</span></div>
          <div className={styles.grid}>
            {games.map((lesson) => (
              <Card
                key={lesson.id}
                onClick={() => setSelectedLesson(lesson)}
                title={lesson.ui_title}
                description={lesson.ui_short_description}
                badge={LESSON_TYPE_LABELS[lesson.lesson_type]}
                badgeVariant="game"
              />
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <div className={styles.sectionLabel}><span>Coming soon</span></div>
        <div className={styles.lockedGrid}>
          {UPCOMING.map((lesson) => (
            <div key={lesson.id} className={styles.lockedCard}>
              <div className={styles.lockedCardTop}>
                <h2>{lesson.ui_title}</h2>
                <span className={styles.lockIcon}>🔒</span>
              </div>
              <p>{lesson.ui_short_description}</p>
            </div>
          ))}
        </div>
      </section>

      {selectedLesson && (
        <LessonModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
        />
      )}
    </div>
  );
}