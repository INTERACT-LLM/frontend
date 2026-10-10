/* all logic lives here, ChatPane and the game panes (TabuPane, TwentyQPane) is for what is rendered */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

const CHAT_ENDPOINT = '/api/chat';
const LLM_STATUS_ENDPOINT = '/api/llm/status';
const LESSON_ENDPOINT = (id) => `/api/lessons/${id}`;
const LESSON_PROMPTS_ENDPOINT = (id, chatId) => `/api/lessons/${id}/prompts?chat_id=${chatId}`;
const FREE_CHAT_PROMPTS_ENDPOINT = (chatId) => `/api/chat/free/prompts?chat_id=${chatId}`;
const IMMEDIATE_FEEDBACK_ENDPOINT = '/api/feedback/immediate';
const DETAILED_FEEDBACK_ENDPOINT = '/api/feedback/detailed';
const GAME_STATE_ENDPOINT = (id, chatId) => `/api/lessons/${id}/game-state?chat_id=${chatId}`;

// what fetchFeedback returns when the request itself fails (same shape as the backend's error)
const FEEDBACK_REQUEST_FAILED = { FeedbackResponse: null, feedback_status: 'error' };

const fetcher = (url) => fetch(url).then((res) => res.json());

//  one id per learner message, shared by the chat call and the feedback call.
// crypto.randomUUID only exists on https:// or localhost, so fall back otherwise.
function makeMessageId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return `msg-${crypto.randomUUID()}`;
    }
    return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function ChatWindow({ lessonId, tutorStarts: tutorStartsProp, ready = true }) {
    const { user } = useUser();

    // When chat terminates, kick the global /llm/status cache so the banner updates immediately.
    const handleTerminated = useCallback(() => {
        globalMutate(LLM_STATUS_ENDPOINT);
    }, []);

    const {
        messages, setMessages, isLoading, streamingContent,
        terminated, resetTerminated, startChat, sendMessage,
    } = useStreamingChat({ onTerminated: handleTerminated });

    const [chatId, setChatId] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const [isComplete, setIsComplete] = useState(false);
    const [detailedFeedback, setDetailedFeedback] = useState(null);
    // 'loading' | 'success' | 'error', so "still waiting" and "failed" are never confused
    const [detailedStatus, setDetailedStatus] = useState('loading');
    const [showDetails, setShowDetails] = useState(false);
    const [gameState, setGameState] = useState(null);
    const [isRestarting, setIsRestarting] = useState(false);

    const chatRequestedRef = useRef(false);

    const searchParams = useSearchParams();
    const tutorStarts = tutorStartsProp ?? searchParams.get("tutor_starts") === "true";

    const { data: lessonData } = useSWR(lessonId ? LESSON_ENDPOINT(lessonId) : null, fetcher);

    // one request creates the chat and carries the user profile with it.
    async function createChat() {
        const res = await fetch(CHAT_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lesson_id: lessonId ?? null,
                tutor_starts: tutorStarts,
                user_profile: {
                    name: user.name,
                    browser_id: user.browser_id, // tells apart learners with the same name
                    language: user.language,
                    proficiency_level: user.proficiency_level,
                    preferences: user.preferences,
                },
            }),
        });
        const data = await res.json();
        return data.chat_id;
    }

    // 1. create the chat directly once the user exists and we are ready
    useEffect(() => {
        if (!user || !ready || chatRequestedRef.current) return;
        chatRequestedRef.current = true;
        createChat().then(setChatId);
    }, [user, ready]);

    // 2. if tutor starts, fire the opener once chat is ready
    useEffect(() => {
        if (!chatId || !tutorStarts) return;
        startChat(chatId);
    }, [chatId, tutorStarts]);

    // 3. load game state for tabu/20Q, waits for chatId
    useEffect(() => {
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

    // Never throws: a failed request becomes a normal error result,
    // so Promise.all in submitNewMessage always finishes.
    async function fetchFeedback(userMessage) {
        try {
            const res = await fetch(IMMEDIATE_FEEDBACK_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    last_user_message: userMessage,
                    lesson_id: lessonId ?? null,
                    chat_id: chatId,
                    message_id: userMessage.id, // give each msg an id, so we can link between feedback and chat messages
                }),
            });
            if (!res.ok) return FEEDBACK_REQUEST_FAILED;
            return await res.json();
        } catch (err) {
            console.error('immediate feedback error:', err);
            return FEEDBACK_REQUEST_FAILED;
        }
    }

    async function fetchDetailedFeedback(msgs) {
        const cleanMessages = msgs.map(({ role, content }) => ({ role, content }));
        const res = await fetch(DETAILED_FEEDBACK_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: cleanMessages,
                lesson_id: lessonId ?? null,
                chat_id: chatId,
            }),
        });
        // a 500 has no JSON body, so stop here with a clear error
        if (!res.ok) throw new Error(`detailed feedback failed: ${res.status}`);
        return res.json();
    }

    async function submitNewMessage(newMessage) {
        if (!newMessage.trim() || isLoading || !!streamingContent || !chatId || terminated) return;
        tabu.checkUserMessage(newMessage);

        // the id is created once here and travels with both calls below.
        const userMessage = { id: makeMessageId(), role: 'user', content: newMessage };
        setMessages((prev) => [...prev, userMessage]);

        const [assistantContent, feedbackResponse] = await Promise.all([
            sendMessage(userMessage, chatId),
            fetchFeedback(userMessage),
        ]);

        if (assistantContent) tabu.checkLLMResponse(assistantContent);

        setFeedbacks((prev) => [...prev, {
            messageId: userMessage.id,
            feedback: feedbackResponse?.FeedbackResponse,
            feedbackStatus: feedbackResponse?.feedback_status ?? 'error',
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

            // reuse the same helper as the first chat
            const newChatId = await createChat();
            setChatId(newChatId);
        } finally {
            setIsRestarting(false);
        }
    }

    async function handleEndLesson() {
        setIsComplete(true);
        setDetailedStatus('loading');
        try {
            const response = await fetchDetailedFeedback(messages);
            if (response?.feedback_status === 'success') {
                setDetailedFeedback(response.GeneralFeedbackResponse);
                setDetailedStatus('success');
            } else {
                console.error('detailed feedback error:', response?.error);
                setDetailedStatus('error');
            }
        } catch (err) {
            console.error('detailed feedback error:', err);
            setDetailedStatus('error');
        } finally {
            fetch(`/api/chat/${chatId}`, { method: 'DELETE' });
        }
    }

    if (isComplete) {
        return (
            <CompletionWindow
                lessonTitle={lessonData?.lesson_presentation.ui_title}
                userTurns={userTurns}
                detailedFeedback={detailedFeedback}
                detailedStatus={detailedStatus}
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
                chatReady={!!chatId} 
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