'use client';

import React from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import styles from './ChatWindow.module.css';
import ChatMessages from "@/components/ChatMessages/ChatMessages";
import ChatInput from "@/components/ChatInput/ChatInput";

const CHAT_ENDPOINT = 'http://localhost:8000/api/chat';
const LESSONS_ENDPOINT = 'http://localhost:8000/api/lessons';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ChatWindow({ lessonId }) {
  const router = useRouter();
  const [messages, setMessages] = React.useState([]);
  const [sessionId] = React.useState(() => `session-${Date.now()}`);
  const [newMessage, setNewMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);

  const { data: lessonData } = useSWR(
    lessonId ? `${LESSONS_ENDPOINT}/${lessonId}` : null,
    fetcher
  );

  // Only count user messages as turns
  const userTurns = messages.filter((m) => m.role === 'user').length;
  const minTurns = lessonData?.min_turns ?? null;
  const canEndLesson = minTurns !== null && userTurns >= minTurns;
  const turnsRemaining = minTurns !== null ? Math.max(0, minTurns - userTurns) : null;
  const progressPct = minTurns ? Math.min(100, Math.round((userTurns / minTurns) * 100)) : 0;

  async function submitNewMessage(event) {
    event.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const userMessage = { role: 'user', content: newMessage };
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage('');

    setIsLoading(true);
    const response = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        session_id: sessionId,
        lesson_id: lessonId,
      }),
    });

    const data = await response.json();
    const messagesShown = data.messages.filter((msg) => msg.role !== 'system');
    setMessages(messagesShown);
    setIsLoading(false);
  }

  if (isComplete) {
    return (
      <div className={styles.completionWrapper}>
        <div className={styles.completionCard}>
          <div className={styles.completionBadge}>Complete</div>
          <h2 className={styles.completionTitle}>{lessonId.toUpperCase()}</h2>
          <p className={styles.completionStat}>
            {userTurns} turn{userTurns !== 1 ? 's' : ''} completed
          </p>
          <button
            className={styles.returnButton}
            onClick={() => router.push('/lessons')}
          >
            ← Return to lessons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pane}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.lessonId}>{lessonId.toUpperCase()}</span>
          {lessonData?.lesson_type && (
            <span className={styles.lessonType}>{lessonData.lesson_type}</span>
          )}
        </div>
        <button
          className={`${styles.endBtn} ${canEndLesson ? styles.endBtnActive : ''}`}
          onClick={() => setIsComplete(true)}
          disabled={!canEndLesson}
          title={
            !canEndLesson && turnsRemaining !== null
              ? `${turnsRemaining} more turn${turnsRemaining !== 1 ? 's' : ''} needed`
              : 'End lesson'
          }
        >
          End lesson
        </button>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        <ChatMessages messages={messages} isLoading={isLoading} />
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        {minTurns !== null && (
          <div className={styles.progressRow}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className={styles.progressLabel}>
              {userTurns} / {minTurns} turns
            </span>
          </div>
        )}
        <ChatInput
          submitNewMessage={submitNewMessage}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}