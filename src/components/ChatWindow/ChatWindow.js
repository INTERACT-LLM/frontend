'use client';

import React from 'react';
import useSWR from 'swr';
import styles from './ChatWindow.module.css';
import ChatMessages from "@/components/ChatMessages/ChatMessages";
import ChatInput from "@/components/ChatInput/ChatInput";
import CompletionWindow from '@/components/CompletionWindow/CompletionWindow';
import ProgressBar from '@/components/ProgressBar/ProgressBar';
import LessonDetailsModal from "@/components/LessonDetailsModal/LessonDetailsModal";
import { useUser } from "@/context/UserContext";

const SESSION_ENDPOINT = '/api/session';
const CHAT_ENDPOINT = '/api/chat';
const LESSON_ENDPOINT = (id) => `/api/lessons/${id}`;
const LESSON_PROMPTS_ENDPOINT = (id, sessionId) => `/api/lessons/${id}/prompts?session_id=${sessionId}`;
const IMMEDIATE_FEEDBACK_ENDPOINT = '/api/feedback/immediate';
const DETAILED_FEEDBACK_ENDPOINT = '/api/feedback/detailed';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ChatWindow({ lessonId }) {
  const { user } = useUser();
  const [messages, setMessages] = React.useState([]);
  const [sessionId] = React.useState(() => `session-${Date.now()}`);
  const [feedbacks, setFeedbacks] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);
  const [detailedFeedback, setDetailedFeedback] = React.useState(null);
  const [showDetails, setShowDetails] = React.useState(false);

  const { data: lessonData } = useSWR(
    lessonId ? LESSON_ENDPOINT(lessonId) : null,
    fetcher
  );

  // Register session once — key is stable so this fires exactly once
  const { data: sessionData } = useSWR(
    user && lessonId ? [SESSION_ENDPOINT, sessionId] : null,
    ([url]) => fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        user_profile: {
          name: user.name,
          language: user.language,
          proficiency_level: user.proficiency_level,
          preferences: user.preferences,
        },
      }),
    }).then((res) => res.json())
  );

  const sessionReady = !!sessionData;

  const { data: promptsData } = useSWR(
    lessonId && sessionData ? LESSON_PROMPTS_ENDPOINT(lessonId, sessionId) : null,
    fetcher
  );

  const userTurns = messages.filter((m) => m.role === 'user').length;
  const minTurns = lessonData?.min_turns ?? null;
  const turnsRemaining = minTurns !== null ? Math.max(0, minTurns - userTurns) : null;
  const canEndLesson = minTurns !== null && userTurns >= minTurns && !isLoading; // add IsLoading check to prevent ending lesson while waiting for response

  async function fetchChat(userMessage) {
    const res = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, session_id: sessionId, lesson_id: lessonId }),
    });
    const data = await res.json();
    console.log("chat response:", data);
    return data;
  }

  async function fetchFeedback(userMessage) {
    return fetch(IMMEDIATE_FEEDBACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ last_user_message: userMessage, lesson_id: lessonId, session_id: sessionId }),
    }).then((res) => res.json());
  }

  async function fetchDetailedFeedback(messages) {
    const cleanMessages = messages.map(({ role, content }) => ({ role, content }));
    return fetch(DETAILED_FEEDBACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: cleanMessages, lesson_id: lessonId, session_id: sessionId }),
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

    const messagesShown = chatResponse?.messages?.filter((msg) => msg.role !== 'system') ?? [];
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

        <div className={styles.headerRight}>
          <button className={styles.detailsBtn} onClick={() => setShowDetails(true)}>
            See lesson details
          </button>
          <button
            className={`${styles.endBtn} ${canEndLesson ? styles.endBtnActive : ''}`}
            onClick={async () => {
              setIsComplete(true);
              try {
                const response = await fetchDetailedFeedback(messages);
                setDetailedFeedback(response?.GeneralFeedbackResponse || '');
              } catch (err) {
                console.error('detailed feedback error:', err);
              } finally {
                fetch(`/api/session/${sessionId}`, { method: 'DELETE' });
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
      </div>

      <div className={styles.messages}>
        <ChatMessages messages={messages} isLoading={isLoading} feedbacks={feedbacks} />
      </div>

      <div className={styles.footer}>
        <ProgressBar userTurns={userTurns} minTurns={minTurns} />
        <ChatInput onSubmit={submitNewMessage} disabled={isLoading || !sessionReady} />
      </div>

      {showDetails && lessonData && (
        <LessonDetailsModal
          lesson={lessonData}
          prompts={promptsData}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
}