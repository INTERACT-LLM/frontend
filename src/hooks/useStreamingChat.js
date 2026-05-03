import React from 'react';

const CHAT_MESSAGE_ENDPOINT = '/api/chat/message';
const CHAT_START_ENDPOINT = '/api/chat/start';

export function useStreamingChat() {
    const [messages, setMessages] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isStreaming, setIsStreaming] = React.useState(false);
    const [streamingContent, setStreamingContent] = React.useState('');

    const typewriterQueue = React.useRef([]);
    const typewriterInterval = React.useRef(null);
    const streamingContentRef = React.useRef('');
    const TYPEWRITER_SPEED_MS = 55;

    React.useEffect(() => {
        streamingContentRef.current = streamingContent;
    }, [streamingContent]);

    function startTypewriter() {
        if (typewriterInterval.current) return;
        typewriterInterval.current = setInterval(() => {
            if (typewriterQueue.current.length === 0) return;
            const token = typewriterQueue.current.shift();
            setStreamingContent((prev) => prev + token);
        }, TYPEWRITER_SPEED_MS);
    }

    function stopTypewriter() {
        if (typewriterInterval.current) {
            clearInterval(typewriterInterval.current);
            typewriterInterval.current = null;
        }
    }

    async function fetchStream(endpoint, body) {
        setIsLoading(true);
        setIsStreaming(false);
        setStreamingContent('');
        streamingContentRef.current = '';
        typewriterQueue.current = [];

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
        setIsLoading(false);
        setIsStreaming(true);
        startTypewriter();

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const collected = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const token = line.slice(6);
                if (token === '[DONE]') continue;

                collected.push(token);
                typewriterQueue.current.push(token);
            }
        }

        await new Promise((resolve) => {
            const check = setInterval(() => {
                if (typewriterQueue.current.length === 0) {
                    clearInterval(check);
                    resolve();
                }
            }, 50);
        });

        stopTypewriter();
        const finalContent = collected.join('');

        setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], content: finalContent };
            return updated;
        });

        setStreamingContent('');
        setIsStreaming(false);

        return finalContent;
    }

    async function startChat(chatId, modelId) {
        return fetchStream(CHAT_START_ENDPOINT, {
            chat_id: chatId,
            model_id: modelId,
        });
    }

    async function sendMessage(message, chatId, modelId) {
        return fetchStream(CHAT_MESSAGE_ENDPOINT, {
            chat_id: chatId,
            message,
            model_id: modelId,
        });
    }

    return { messages, setMessages, isLoading, isStreaming, streamingContent, startChat, sendMessage };
}