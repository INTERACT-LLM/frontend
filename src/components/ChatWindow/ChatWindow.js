'use client';

import React from 'react';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useLLMConfig } from '@/context/LLMConfigContext';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { useChatSession } from '@/hooks/useChatSession';
import { useLessonFeedback } from '@/hooks/useLessonFeedback';
import { useGameState } from '@/hooks/useGameState';
import ChatPane from '@/components/ChatPane/ChatPane';
import TabuPane from '@/components/TabuPane/TabuPane';
import TwentyQPane from '@/components/TwentyQPane/TwentyQPane';
import CompletionWindow from '@/components/CompletionWindow/CompletionWindow';
import styles from './ChatWindow.module.css';

const LESSON_ENDPOINT = (id) => `/api/lessons/${id}`;
const fetcher = (url) => fetch(url).then(res => res.json());

export default function ChatWindow({ lessonId, tutorStarts: tutorStartsProp, ready = true }) {
    const { user } = useUser();
    const { selectedModel } = useLLMConfig();
    const { messages, setMessages, isLoading, streamingContent, startChat, sendMessage } = useStreamingChat();

    const searchParams = useSearchParams();
    const tutorStarts = tutorStartsProp ?? searchParams.get('tutor_starts') === 'true';

    const { data: lessonData } = useSWR(lessonId ? LESSON_ENDPOINT(lessonId) : null, fetcher);

    const { sessionId, chatId, promptsData, freeChatPromptData } = useChatSession({
        user, ready, lessonId, tutorStarts, selectedModel, startChat,
    });

    const { feedbacks, detailedFeedback, addFeedback, fetchDetailedFeedback } = useLessonFeedback({
        lessonId, chatId, selectedModel,
    });

    const { gameState, tabu, twentyQ, userTurns, turnsRemaining, canEndLesson } = useGameState({
        lessonId, lessonData, chatId, messages, isLoading,
    });

    const [isComplete, setIsComplete] = React.useState(false);
    const [showDetails, setShowDetails] = React.useState(false);
    const hasAssistantResponded = messages.some(m => m.role === 'assistant');

    async function submitNewMessage(newMessage) {
        if (!newMessage.trim() || isLoading || !chatId) return;
        tabu.checkUserMessage(newMessage);

        const userMessage = { role: 'user', content: newMessage };
        setMessages(prev => [...prev, userMessage]);

        await Promise.all([
            sendMessage(userMessage, chatId, selectedModel),
            lessonId ? addFeedback(userMessage) : Promise.resolve(),
        ]).then(([assistantContent]) => {
            if (assistantContent) tabu.checkLLMResponse(assistantContent);
        });
    }

    async function handleEndLesson() {
        setIsComplete(true);
        try {
            await fetchDetailedFeedback(messages);
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
                minTurns={lessonData?.min_turns ?? null}
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