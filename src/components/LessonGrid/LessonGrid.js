"use client";

import React from "react";
import useSWR from "swr";
import Card from "@/components/Card/Card";
import styles from "./LessonGrid.module.css";

const ENDPOINT = "http://localhost:8000/api/lessons";

const UPCOMING = [
  { id: "u1", title: "🍊 At the market", description: "Practise numbers, food vocab and haggling." },
  { id: "u2", title: "🗺️ Giving directions", description: "Navigate streets and landmarks in Spanish." },
  { id: "u3", title: "📅 Making plans", description: "Suggest, accept and decline invitations." },
  { id: "u4", title: "🏡 Talking about family", description: "Describe people and relationships." },
];

async function fetcher(url) {
  const res = await fetch(url);
  return res.json();
}

export default function LessonGrid() {
  const { data, isLoading, error } = useSWR(ENDPOINT, fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading lessons.</div>;

  return (
    <div className={styles.page}>

      <div className={styles.intro}>
        <h1 className={styles.introTitle}>Ready to learn, Mina?</h1>
        <p className={styles.introSub}>Tap on any available lesson to get started.</p>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Available lessons</h2>
        <div className={styles.grid}>
          {data?.lessons.map((lesson) => (
            <Card
              key={lesson.id}
              href={`/lessons/${lesson.id}`}
              title={lesson.ui_title}
              description={lesson.ui_lesson_description}
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionHeading}>Upcoming lessons</h2>
        <div className={styles.grid}>
          {UPCOMING.map((lesson) => (
            <div key={lesson.id} className={styles.lockedCard}>
              <span className={styles.lock}>🔒</span>
              <h2>{lesson.title}</h2>
              <p>{lesson.description}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}