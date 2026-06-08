import React from 'react';

const CHAT_MESSAGE_ENDPOINT = '/api/chat/message';
const CHAT_START_ENDPOINT = '/api/chat/start';

export function useStreamingChat({ onTerminated } = {}) {
    const [messages, setMessages] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [streamingContent, setStreamingContent] = React.useState('');
    const [terminated, setTerminated] = React.useState(null); // null | { reason, provider }

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

    function resetTerminated() {
        setTerminated(null);
    }

    async function fetchStream(endpoint, body) {
        setIsLoading(true);
        setStreamingContent('');
        streamingContentRef.current = '';
        typewriterQueue.current = [];

        let response;
        try {
            response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        } catch (networkErr) {
            // Network error reaching the backend itself — treat as termination.
            setIsLoading(false);
            const info = { reason: 'network_error', provider: null };
            setTerminated(info);
            onTerminated?.(info);
            return null;
        }

        // 410 Gone: chat already terminated server-side.
        if (response.status === 410) {
            setIsLoading(false);
            let detail = {};
            try { detail = (await response.json()).detail ?? {}; } catch {}
            const info = { reason: detail.reason ?? 'chat_terminated', provider: null };
            setTerminated(info);
            onTerminated?.(info);
            return null;
        }

        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
        setIsLoading(false);
        startTypewriter();

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const collected = [];
        let errorInfo = null;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const payload = line.slice(6);
                if (payload === '[DONE]') continue;

                // Detect structured error event from the backend.
                // Plain text tokens don't start with '{', so this is cheap.
                if (payload.startsWith('{')) {
                    try {
                        const parsed = JSON.parse(payload);
                        if (parsed.error) {
                            errorInfo = {
                                reason: parsed.error,
                                provider: parsed.provider ?? null,
                            };
                            continue;
                        }
                    } catch {
                        // Not JSON after all — fall through and treat as a token.
                    }
                }

                collected.push(payload);
                typewriterQueue.current.push(payload);
            }
        }

        // Wait for typewriter to drain
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
            updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: finalContent,
            };
            return updated;
        });
        setStreamingContent('');

        if (errorInfo) {
            setTerminated(errorInfo);
            onTerminated?.(errorInfo);
        }

        return finalContent;
    }

    async function startChat(chatId) {
        return fetchStream(CHAT_START_ENDPOINT, { chat_id: chatId });
    }

    async function sendMessage(message, chatId) {
        return fetchStream(CHAT_MESSAGE_ENDPOINT, { chat_id: chatId, message });
    }

    return {
        messages,
        setMessages,
        isLoading,
        streamingContent,
        terminated,
        resetTerminated,
        startChat,
        sendMessage,
    };
}