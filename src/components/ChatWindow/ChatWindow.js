/* all logic lives here, ChatPane and the game panes (TabuPane, TwentyQPane) is for what is rendered */
'use client';

import React from 'react';
import useSWR from 'swr';
import { useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useTabuGame } from '@/hooks/useTabuGame';
import { useTwentyQGame } from '@/hooks/useTwentyQGame';
import { useLLMConfig } from '@/context/LLMConfigContext';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import ChatPane from '@/components/ChatPane/ChatPane';
import TabuPane from '@/components/TabuPane/TabuPane';
import TwentyQPane from '@/components/TwentyQPane/TwentyQPane';
import CompletionWindow from '@/components/CompletionWindow/CompletionWindow';
import styles from './ChatWindow.module.css';

const SESSION_ENDPOINT = '/api/session';
const CHAT_ENDPOINT = '/api/chat';
const LESSON_ENDPOINT = (id) => `/api/lessons/${id}`;
const LESSON_PROMPTS_ENDPOINT = (id, chatId) => `/api/lessons/${id}/prompts?chat_id=${chatId}`;
const FREE_CHAT_PROMPTS_ENDPOINT = (chatId) => `/api/chat/free/prompts?chat_id=${chatId}`;
const IMMEDIATE_FEEDBACK_ENDPOINT = '/api/feedback/immediate';
const DETAILED_FEEDBACK_ENDPOINT = '/api/feedback/detailed';
const GAME_STATE_ENDPOINT = (id, chatId) => `/api/lessons/${id}/game-state?chat_id=${chatId}`;

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ChatWindow({ lessonId }) {
    const { user } = useUser();
    const { selectedModel } = useLLMConfig();

    const { messages, setMessages, isLoading, streamingContent, startChat, sendMessage } = useStreamingChat();
    const [sessionId] = React.useState(() => `session-${Date.now()}`);
    const [chatId, setChatId] = React.useState(null);
    const [feedbacks, setFeedbacks] = React.useState([]);
    const [isComplete, setIsComplete] = React.useState(false);
    const [detailedFeedback, setDetailedFeedback] = React.useState(null);
    const [showDetails, setShowDetails] = React.useState(false);
    const [gameState, setGameState] = React.useState(null);

    const searchParams = useSearchParams();
    const tutorStarts = searchParams.get("tutor_starts") === "true";

    const { data: lessonData } = useSWR(lessonId ? LESSON_ENDPOINT(lessonId) : null, fetcher);

    // 1. create user session
    const { data: sessionData } = useSWR(
        user ? [SESSION_ENDPOINT, sessionId] : null,
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
        if (!sessionData) return;
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
    }, [sessionData]);

    // 3. if tutor starts, fire the opener once chat is ready
    React.useEffect(() => {
        if (!chatId || !tutorStarts) return;
        startChat(chatId, selectedModel);
    }, [chatId]);

    // 4. load game state for tabu/20Q — waits for chatId
    React.useEffect(() => {
        if (!lessonId || !lessonData || !chatId) return;
        fetch(GAME_STATE_ENDPOINT(lessonId, chatId))
            .then(res => res.ok ? res.json() : null)
            .then(data => setGameState(data));
    }, [lessonId, lessonData, chatId]);

    // waits for chatId so snapshotted config is available on backend
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

    const canEndLesson = lessonId
        ? (tabu.guessed || twentyQ.result !== null || (minTurns !== null && userTurns >= minTurns && !isLoading))
        : true;

    async function fetchFeedback(userMessage) {
        return fetch(IMMEDIATE_FEEDBACK_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                last_user_message: userMessage,
                lesson_id: lessonId,
                chat_id: chatId,
                model_id: selectedModel,
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
                lesson_id: lessonId,
                chat_id: chatId,
                model_id: selectedModel,
            }),
        }).then((res) => res.json());
    }

    async function submitNewMessage(newMessage) {
        if (!newMessage.trim() || isLoading || !chatId) return;
        tabu.checkUserMessage(newMessage);

        const userMessage = { role: 'user', content: newMessage };
        setMessages((prev) => [...prev, userMessage]);

        if (lessonId) {
            const [assistantContent, feedbackResponse] = await Promise.all([
                sendMessage(userMessage, chatId, selectedModel),
                fetchFeedback(userMessage),
            ]);
            if (assistantContent) tabu.checkLLMResponse(assistantContent);
            setFeedbacks((prev) => [...prev, {
                feedback: feedbackResponse?.FeedbackResponse,
                feedbackStatus: feedbackResponse?.feedback_status,
            }]);
        } else {
            const assistantContent = await sendMessage(userMessage, chatId, selectedModel);
            if (assistantContent) tabu.checkLLMResponse(assistantContent);
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