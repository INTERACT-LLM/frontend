/* all logic lives here, ChatPane and the game panes (TabuPane, TwentyQPane) is for what is rendered */
'use client';

import React from 'react';
import useSWR, { mutate as globalMutate } from 'swr';
import { useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useTabuGame } from '@/hooks/useTabuGame';
import { useTwentyQGame } from '@/hooks/useTwentyQGame';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import ChatPane from '@/components/ChatPane/ChatPane';
import TabuPane from '@/components/TabuPane/TabuPane';
import TwentyQPane from '@/components/TwentyQPane/TwentyQPane';
import CompletionWindow from '@/components/CompletionWindow/CompletionWindow';
import styles from './ChatWindow.module.css';

const SESSION_ENDPOINT = '/api/session';
const CHAT_ENDPOINT = '/api/chat';
const LLM_STATUS_ENDPOINT = '/api/llm/status';
const LESSON_ENDPOINT = (id) => `/api/lessons/${id}`;
const LESSON_PROMPTS_ENDPOINT = (id, chatId) => `/api/lessons/${id}/prompts?chat_id=${chatId}`;
const FREE_CHAT_PROMPTS_ENDPOINT = (chatId) => `/api/chat/free/prompts?chat_id=${chatId}`;
const IMMEDIATE_FEEDBACK_ENDPOINT = '/api/feedback/immediate';
const DETAILED_FEEDBACK_ENDPOINT = '/api/feedback/detailed';
const GAME_STATE_ENDPOINT = (id, chatId) => `/api/lessons/${id}/game-state?chat_id=${chatId}`;

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ChatWindow({ lessonId, tutorStarts: tutorStartsProp, ready = true }) {
    const { user } = useUser();

    // When chat terminates, kick the global /llm/status cache so the banner updates immediately.
    const handleTerminated = React.useCallback(() => {
        globalMutate(LLM_STATUS_ENDPOINT);
    }, []);

    const {
        messages, setMessages, isLoading, streamingContent,
        terminated, resetTerminated, startChat, sendMessage,
    } = useStreamingChat({ onTerminated: handleTerminated });

    const [sessionId] = React.useState(() => `session-${Date.now()}`);
    const [chatId, setChatId] = React.useState(null);
    const [feedbacks, setFeedbacks] = React.useState([]);
    const [isComplete, setIsComplete] = React.useState(false);
    const [detailedFeedback, setDetailedFeedback] = React.useState(null);
    const [showDetails, setShowDetails] = React.useState(false);
    const [gameState, setGameState] = React.useState(null);
    const [isRestarting, setIsRestarting] = React.useState(false);

    const searchParams = useSearchParams();
    const tutorStarts = tutorStartsProp ?? searchParams.get("tutor_starts") === "true";

    const { data: lessonData } = useSWR(lessonId ? LESSON_ENDPOINT(lessonId) : null, fetcher);

    // 1. create user session, gated on ready
    const { data: sessionData } = useSWR(
        user && ready ? [SESSION_ENDPOINT, sessionId] : null,
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

    // 2. create chat once session exists, snapshot config
    React.useEffect(() => {
        if (!sessionData || !ready) return;
        fetch(CHAT_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: sessionId,
                lesson_id: lessonId ?? null,
                tutor_starts: tutorStarts,
            }),
        })
            .then((res) => res.json())
            .then((data) => setChatId(data.chat_id));
    }, [sessionData, ready]);

    // 3. if tutor starts, fire the opener once chat is ready
    React.useEffect(() => {
        if (!chatId || !tutorStarts) return;
        startChat(chatId);
    }, [chatId, tutorStarts]);

    // 4. load game state for tabu/20Q, waits for chatId
    React.useEffect(() => {
        if (!lessonId || !lessonData || !chatId) return;
        fetch(GAME_STATE_ENDPOINT(lessonId, chatId))
            .then(res => res.ok ? res.json() : null)
            .then(data => setGameState(data));
    }, [lessonId, lessonData, chatId]);

    const { data: promptsData } = useSWR(
        lessonId && chatId ? LESSON_PROMPTS_ENDPOINT(lessonId, chatId) : null,
        fetcher
    );

    const { data: freeChatPromptData } = useSWR(
        !lessonId && chatId ? FREE_CHAT_PROMPTS_ENDPOINT(chatId) : null,
        fetcher
    );

    const tabu = useTabuGame(gameState?.game_type === 'tabu' ? gameState : null);
    const twentyQ = useTwentyQGame(gameState?.game_type === 'twenty_questions' ? gameState : null);

    const userTurns = messages.filter((m) => m.role === 'user').length;
    const minTurns = lessonData?.min_turns ?? null;
    const turnsRemaining = minTurns !== null ? Math.max(0, minTurns - userTurns) : null;
    const hasAssistantResponded = messages.some(m => m.role === 'assistant');

    const canEndLesson = !terminated && (lessonId
        ? (tabu.guessed || twentyQ.result !== null || (minTurns !== null && userTurns >= minTurns && !isLoading))
        : true);

    async function fetchFeedback(userMessage) {
        return fetch(IMMEDIATE_FEEDBACK_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                last_user_message: userMessage,
                lesson_id: lessonId ?? null,
                chat_id: chatId,
            }),
        }).then((res) => res.json());
    }

    async function fetchDetailedFeedback(msgs) {
        const cleanMessages = msgs.map(({ role, content }) => ({ role, content }));
        return fetch(DETAILED_FEEDBACK_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: cleanMessages,
                lesson_id: lessonId ?? null,
                chat_id: chatId,
            }),
        }).then((res) => res.json());
    }

    async function submitNewMessage(newMessage) {
        if (!newMessage.trim() || isLoading || !!streamingContent || !chatId || terminated) return;
        tabu.checkUserMessage(newMessage);

        const userMessage = { role: 'user', content: newMessage };
        setMessages((prev) => [...prev, userMessage]);

        const [assistantContent, feedbackResponse] = await Promise.all([
            sendMessage(userMessage, chatId),
            fetchFeedback(userMessage),
        ]);

        if (assistantContent) tabu.checkLLMResponse(assistantContent);

        setFeedbacks((prev) => [...prev, {
            feedback: feedbackResponse?.FeedbackResponse,
            feedbackStatus: feedbackResponse?.feedback_status,
        }]);
    }

    async function handleRestart() {
        if (isRestarting) return;
        setIsRestarting(true);
        try {
            // Clean up the old chat server-side
            if (chatId) {
                fetch(`/api/chat/${chatId}`, { method: 'DELETE' });
            }
            // Reset local state
            setMessages([]);
            setFeedbacks([]);
            setChatId(null);
            resetTerminated();

            // Create a new chat — will bind to whichever provider is active now
            const res = await fetch(CHAT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    lesson_id: lessonId ?? null,
                    tutor_starts: tutorStarts,
                }),
            });
            const data = await res.json();
            setChatId(data.chat_id);
        } finally {
            setIsRestarting(false);
        }
    }

    async function handleEndLesson() {
        setIsComplete(true);
        try {
            const response = await fetchDetailedFeedback(messages);
            setDetailedFeedback(response?.GeneralFeedbackResponse || '');
        } catch (err) {
            console.error('detailed feedback error:', err);
        } finally {
            fetch(`/api/chat/${chatId}`, { method: 'DELETE' });
            fetch(`/api/session/${sessionId}`, { method: 'DELETE' });
        }
    }

    if (isComplete) {
        return (
            <CompletionWindow
                lessonTitle={lessonData?.lesson_presentation.ui_title}
                userTurns={userTurns}
                detailedFeedback={detailedFeedback}
            />
        );
    }

    return (
        <div className={gameState ? styles.gameLayout : styles.solo}>
            <div className={styles.lessonHeader} />
            <ChatPane
                lessonData={lessonData}
                messages={messages}
                feedbacks={feedbacks}
                isLoading={isLoading}
                sessionReady={!!chatId}
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
                streamingContent={streamingContent}
                isFreeChat={!lessonId}
                freeChatPrompt={freeChatPromptData?.chat_system_prompt}
                tutorStarts={tutorStarts}
                terminated={terminated}
                isRestarting={isRestarting}
                onRestart={handleRestart}
            />
            {gameState?.game_type === 'tabu' && (
                <TabuPane
                    secretWord={tabu.secretWord}
                    forbiddenWords={tabu.forbiddenWords}
                    violations={tabu.violations}
                    guessed={tabu.guessed}
                    guessNudge={tabu.guessNudge}
                    onConfirmGuess={tabu.confirmGuess}
                    onDismissNudge={tabu.dismissNudge}
                    hasAssistantResponded={hasAssistantResponded}
                />
            )}
            {gameState?.game_type === 'twenty_questions' && (
                <TwentyQPane
                    secretConcept={twentyQ.secretWord}
                    questionCount={userTurns}
                    maxQuestions={twentyQ.maxQuestions}
                    gameOver={userTurns >= twentyQ.maxQuestions}
                    result={twentyQ.result}
                    hasAssistantResponded={hasAssistantResponded}
                    onGuessedIt={twentyQ.confirmGuess}
                    onGaveUp={twentyQ.gaveUp}
                />
            )}
        </div>
    );
}