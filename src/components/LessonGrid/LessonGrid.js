"use client";

import React from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import Card from "@/components/Card/Card";
import LessonModal from "@/components/LessonPreviewModal/LessonPreviewModal";
import styles from "./LessonGrid.module.css";
import { useUser } from "@/context/UserContext";

const LESSONS_ENDPOINT = '/api/lessons';

const UPCOMING = [
  { id: "u1", ui_title: "🍊 At the Market", ui_short_description: "Practise numbers, food vocab and haggling." },
  { id: "u2", ui_title: "🗺️ Giving Directions", ui_short_description: "Navigate streets and landmarks in Spanish." },
  { id: "u3", ui_title: "📅 Making Plans", ui_short_description: "Suggest, accept and decline invitations." },
  { id: "u4", ui_title: "🏡 Talking about Family", ui_short_description: "Describe people and relationships." },
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
  const { user } = useUser();
  const router = useRouter();
  const firstName = user?.name?.split(' ')?.[0] || '';

  const { data, isLoading, error } = useSWR(LESSONS_ENDPOINT, fetcher);
  const [selectedLesson, setSelectedLesson] = React.useState(null);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading lessons.</div>;

  const roleplays = data?.lessons.filter((l) => l.lesson_type === "roleplay") ?? [];
  const games = data?.lessons.filter((l) => l.lesson_type === "vocabulary_game") ?? [];

  return (
    <div className={styles.page}>
      <div className={styles.intro}>
        <h1 className={styles.introTitle}>Ready to learn, {firstName}?</h1>
        <p className={styles.introSub}>Tap on any available lesson to get started.</p>
      </div>

      {roleplays.length > 0 && (
        <section className={styles.section}>
          <div className={`${styles.sectionLabel} ${styles.sectionLabel_roleplay}`}><span>Roleplays</span></div>
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
          <div className={`${styles.sectionLabel} ${styles.sectionLabel_game}`}><span>Games</span></div>
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

      {/* Free chat banner */}
      <section className={styles.section}>
        <button className={styles.freeChatBanner} onClick={() => router.push('/chat/free')}>
          <div className={styles.freeChatBannerLeft}>
            <div className={styles.freeChatIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <p className={styles.freeChatTitle}>Just want to talk?</p>
              <p className={styles.freeChatSub}>No lesson, no rules — free conversation practice</p>
            </div>
          </div>
          <span className={styles.freeChatCta}>Try it →</span>
        </button>
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