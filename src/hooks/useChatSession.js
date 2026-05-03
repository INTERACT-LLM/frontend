import React from 'react';
import useSWR from 'swr';

const SESSION_ENDPOINT = '/api/session';
const CHAT_ENDPOINT = '/api/chat';
const LESSON_PROMPTS_ENDPOINT = (id, chatId) => `/api/lessons/${id}/prompts?chat_id=${chatId}`;
const FREE_CHAT_PROMPTS_ENDPOINT = (chatId) => `/api/chat/free/prompts?chat_id=${chatId}`;

export function useChatSession({ user, ready, lessonId, tutorStarts, selectedModel, startChat }) {

    const sessionId = React.useRef(`session-${Date.now()}`).current;

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
        }).then(res => res.json()),
        { revalidateOnFocus: false }
    );

    const { data: chatData } = useSWR(
        sessionData && ready ? [CHAT_ENDPOINT, sessionId] : null,
        ([url]) => fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: sessionId,
                lesson_id: lessonId ?? null,
                tutor_starts: tutorStarts,
            }),
        }).then(res => res.json()),
        { revalidateOnFocus: false }
    );

    const chatId = chatData?.chat_id ?? null;

    const didStartChat = React.useRef(false);
    React.useEffect(() => {
        if (!chatId || !tutorStarts || didStartChat.current) return;
        didStartChat.current = true;
        startChat(chatId, selectedModel);
    }, [chatId, tutorStarts]);

    const { data: promptsData } = useSWR(
        lessonId && chatId ? LESSON_PROMPTS_ENDPOINT(lessonId, chatId) : null,
        (url) => fetch(url).then(res => res.json())
    );

    const { data: freeChatPromptData } = useSWR(
        !lessonId && chatId ? FREE_CHAT_PROMPTS_ENDPOINT(chatId) : null,
        (url) => fetch(url).then(res => res.json())
    );

    return { sessionId, chatId, promptsData, freeChatPromptData };
}