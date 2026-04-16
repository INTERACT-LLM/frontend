"use client";

import React from "react";
import useSWR from "swr";
import Card from "@/components/Card/Card";
import styles from "./LessonGrid.module.css";

const ENDPOINT = "http://localhost:8000/api/lessons";

async function fetcher(endpoint) {
    const response = await fetch(endpoint);
    const json = await response.json();
    return json;
}

export default function LessonGrid() {
    const { data, isLoading, error } = useSWR(ENDPOINT, fetcher);

    if (isLoading) {return <div>Loading...</div>;}
    if (error) {return <div>Error loading lessons.</div>;}
    console.log("Fetched lessons:", data);

    return (
    <div className={styles.grid}>
        {data?.lessons.map((lesson) => (
            <Card
            key={lesson.id}
            href={`/chat/${lesson.id}`}
            title={lesson.ui_title}
            description={lesson.ui_lesson_description}
            />
        ))}
    </div>
  );
}