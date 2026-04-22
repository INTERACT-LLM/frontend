'use client';

import React from 'react';
import useSWR from 'swr';
import styles from './ChatWindow.module.css';
import ChatMessages from "@/components/ChatMessages/ChatMessages";
import ChatInput from "@/components/ChatInput/ChatInput";
import CompletionWindow from '@/components/CompletionWindow/CompletionWindow';
import ProgressBar from '@/components/ProgressBar/ProgressBar';

const CHAT_ENDPOINT = 'http://localhost:8000/api/chat';
const LESSONS_ENDPOINT = 'http://localhost:8000/api/lessons';
const FEEDBACK_ENDPOINT = 'http://localhost:8000/api/feedback/immediate';
const DETAILED_FEEDBACK_ENDPOINT = 'http://localhost:8000/api/feedback/detailed';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ChatWindow({ lessonId }) {
  const [messages, setMessages] = React.useState([]);
  const [sessionId] = React.useState(() => `session-${Date.now()}`);
  const [feedbacks, setFeedbacks] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);
  const [detailedFeedback, setDetailedFeedback] = React.useState(null);

  const { data: lessonData } = useSWR(
    lessonId ? `${LESSONS_ENDPOINT}/${lessonId}` : null,
    fetcher
  );

  const userTurns = messages.filter((m) => m.role === 'user').length;
  const minTurns = lessonData?.min_turns ?? null;
  const turnsRemaining = minTurns !== null ? Math.max(0, minTurns - userTurns) : null;
  const canEndLesson = minTurns !== null && userTurns >= minTurns;


  async function fetchChat(userMessage) {
    return fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, session_id: sessionId, lesson_id: lessonId }),
    }).then((res) => res.json());
  }

  async function fetchFeedback(userMessage) {
    return fetch(FEEDBACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ last_user_message: userMessage, lesson_id: lessonId }),
    }).then((res) => res.json());
  }

  async function fetchDetailedFeedback(messages) {
    const cleanMessages = messages.map(({ role, content }) => ({ role, content }));
    return fetch(DETAILED_FEEDBACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: cleanMessages, lesson_id: lessonId}),
    }).then((res) => res.json());
  }

  async function submitNewMessage(newMessage) {
    if (!newMessage.trim() || isLoading) return;

    const userMessage = { role: 'user', content: newMessage };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const [chatResponse, feedbackResponse] = await Promise.all([
      fetchChat(userMessage),
      fetchFeedback(userMessage),
    ]);

    const messagesShown = chatResponse.messages.filter((msg) => msg.role !== 'system');
    setMessages(messagesShown);
    setFeedbacks((prev) => [...prev, { feedback: feedbackResponse?.FeedbackResponse, feedbackStatus: feedbackResponse?.feedback_status }]);
    setIsLoading(false);
  }

  if (isComplete) {
    return <CompletionWindow lessonId={lessonId} userTurns={userTurns} detailedFeedback={detailedFeedback} />;
  }

  return (
    <div className={styles.pane}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.lessonId}>{lessonId.toUpperCase()}</span>
          {lessonData?.lesson_type && (
            <span className={styles.lessonType}>{lessonData.lesson_type}</span>
          )}
        </div>
        <button
          className={`${styles.endBtn} ${canEndLesson ? styles.endBtnActive : ''}`}
          onClick={async () => {
            setIsComplete(true);
            try {
              const response = await fetchDetailedFeedback(messages);
              setDetailedFeedback(response?.GeneralFeedbackResponse || '');
            } catch (err) {
              console.error('detailed feedback error:', err);
            }
          }}
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

      <div className={styles.messages}>
        <ChatMessages messages={messages} isLoading={isLoading} feedbacks={feedbacks} />
      </div>

      <div className={styles.footer}>
        <ProgressBar userTurns={userTurns} minTurns={minTurns} />
        <ChatInput onSubmit={submitNewMessage} disabled={isLoading} />
      </div>
    </div>
  );
}