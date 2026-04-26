'use client';

import React from 'react';
import useSWR from 'swr';
import { useUser } from "@/context/UserContext";
import { useTabuGame } from '@/hooks/useTabuGame';
import ChatPane from '@/components/ChatPane/ChatPane';
import TabuPane from '@/components/TabuPane/TabuPane';
import CompletionWindow from '@/components/CompletionWindow/CompletionWindow';
import styles from './ChatWindow.module.css';

const SESSION_ENDPOINT = '/api/session';
const CHAT_ENDPOINT = '/api/chat';
const LESSON_ENDPOINT = (id) => `/api/lessons/${id}`;
const LESSON_PROMPTS_ENDPOINT = (id, sessionId) => `/api/lessons/${id}/prompts?session_id=${sessionId}`;
const IMMEDIATE_FEEDBACK_ENDPOINT = '/api/feedback/immediate';
const DETAILED_FEEDBACK_ENDPOINT = '/api/feedback/detailed';
const GAME_STATE_ENDPOINT = (id) => `/api/lessons/${id}/game-state`;

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
  const [gameState, setGameState] = React.useState(null);

  const { data: lessonData } = useSWR(lessonId ? LESSON_ENDPOINT(lessonId) : null, fetcher);

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

  const { data: promptsData } = useSWR(
    lessonId && sessionData ? LESSON_PROMPTS_ENDPOINT(lessonId, sessionId) : null,
    fetcher
  );
  
  // if lesson has a game state (like tabu), fetch it to determine what to render 
  // note: (need to define game state in lessons api for coming lessons for this to work beyond tabu)
  React.useEffect(() => {
      if (!lessonData) return;
      fetch(GAME_STATE_ENDPOINT(lessonId))
        .then(res => res.ok ? res.json() : null)
        .then(data => setGameState(data));
    }, [lessonId, lessonData]); // lessonData as dep so it waits for lesson to load, but only fires once since lessonData doesn't change

  const tabu = useTabuGame(gameState ?? null);

  const userTurns = messages.filter((m) => m.role === 'user').length;
  const minTurns = lessonData?.min_turns ?? null;
  const turnsRemaining = minTurns !== null ? Math.max(0, minTurns - userTurns) : null;
  const canEndLesson = tabu.guessed || (minTurns !== null && userTurns >= minTurns && !isLoading);

  // --- API calls ---

  async function fetchChat(userMessage) {
    const res = await fetch(CHAT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, session_id: sessionId, lesson_id: lessonId }),
    });
    return res.json();
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

  // --- Handlers ---

  async function submitNewMessage(newMessage) {
    if (!newMessage.trim() || isLoading) return;
    tabu.checkUserMessage(newMessage);

    const userMessage = { role: 'user', content: newMessage };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const [chatResponse, feedbackResponse] = await Promise.all([
      fetchChat(userMessage),
      fetchFeedback(userMessage),
    ]);

    const messagesShown = chatResponse?.messages?.filter((msg) => msg.role !== 'system') ?? [];
    setMessages(messagesShown);

    const lastAssistant = messagesShown.filter(m => m.role === 'assistant').at(-1);
    if (lastAssistant) tabu.checkLLMResponse(lastAssistant.content);

    setFeedbacks((prev) => [...prev, {
      feedback: feedbackResponse?.FeedbackResponse,
      feedbackStatus: feedbackResponse?.feedback_status
    }]);
    setIsLoading(false);
  }

  async function handleEndLesson() {
    setIsComplete(true);
    try {
      const response = await fetchDetailedFeedback(messages);
      setDetailedFeedback(response?.GeneralFeedbackResponse || '');
    } catch (err) {
      console.error('detailed feedback error:', err);
    } finally {
      fetch(`/api/session/${sessionId}`, { method: 'DELETE' });
    }
  }

  // --- Render ---

  if (isComplete) {
    return <CompletionWindow lessonTitle={lessonData?.lesson_presentation.ui_title} userTurns={userTurns} detailedFeedback={detailedFeedback} />;
  }

  return (
    <div className={gameState ? styles.gameLayout : styles.solo}>
      <ChatPane
        lessonData={lessonData}
        messages={messages}
        feedbacks={feedbacks}
        isLoading={isLoading}
        sessionReady={!!sessionData}
        promptsData={promptsData}
        showDetails={showDetails}
        onShowDetails={() => setShowDetails(true)}
        onCloseDetails={() => setShowDetails(false)}
        canEndLesson={canEndLesson}
        turnsRemaining={turnsRemaining}
        userTurns={userTurns}
        minTurns={minTurns}
        onSubmit={submitNewMessage}
        onEndLesson={handleEndLesson}
      />
      {gameState && (
        <TabuPane
          secretWord={tabu.secretWord}
          forbiddenWords={tabu.forbiddenWords}
          violations={tabu.violations}
          guessed={tabu.guessed}
          guessNudge={tabu.guessNudge}
          onConfirmGuess={tabu.confirmGuess}
          onDismissNudge={tabu.dismissNudge}
          hasAssistantResponded={messages.some(m => m.role === 'assistant')}
        />
      )}
    </div>
  );
}