import React from 'react';

const CHAT_MESSAGE_ENDPOINT = '/api/chat/message';
const CHAT_START_ENDPOINT = '/api/chat/start';

// Typewriter tuning
const TICK_MS = 16;                // how often we check the queue (~60 per second)
const BASE_WORDS_PER_SECOND = 18;  // normal pace, close to the old 55 ms per token
const MAX_LAG_SECONDS = 1.5;       // never fall further behind the stream than this

// Intl.Segmenter splits text into words correctly for all languages,
// including ones without spaces (Chinese, Japanese, Thai).
const wordSegmenter =
    typeof Intl !== 'undefined' && Intl.Segmenter
        ? new Intl.Segmenter(undefined, { granularity: 'word' })
        : null;

// Turns "Hello, world! How" into ["Hello, ", "world! ", "How"].
// Spaces and punctuation stick to the word before them, so each
// unit appears as one visual "word".
function splitIntoWords(text) {
    if (!wordSegmenter) {
        return text.match(/\S+\s*|\s+/g) ?? [];
    }
    const units = [];
    for (const { segment, isWordLike } of wordSegmenter.segment(text)) {
        if (!isWordLike && units.length > 0) {
            units[units.length - 1] += segment;
        } else {
            units.push(segment);
        }
    }
    return units;
}

export function useStreamingChat({ onTerminated } = {}) {
    const [messages, setMessages] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [streamingContent, setStreamingContent] = React.useState('');
    const [terminated, setTerminated] = React.useState(null); // null | { reason, provider }

    // Queue holds whole words, not raw provider chunks.
    const typewriterQueue = React.useRef([]);
    // Text that may still be an unfinished word (e.g. "hel" waiting for "lo").
    const pendingText = React.useRef('');
    const typewriterInterval = React.useRef(null);
    const lastTickTime = React.useRef(0);
    const wordBudget = React.useRef(0);
    const streamingContentRef = React.useRef('');

    React.useEffect(() => {
        streamingContentRef.current = streamingContent;
    }, [streamingContent]);

    // Stop the timer if the component unmounts mid-stream.
    React.useEffect(() => {
        return () => stopTypewriter();
    }, []);

    function enqueueText(text) {
        pendingText.current += text;
        const units = splitIntoWords(pendingText.current);
        // The last unit might be cut off mid-word, so hold it back
        // until the next chunk arrives.
        pendingText.current = units.pop() ?? '';
        typewriterQueue.current.push(...units);
    }

    function flushPending() {
        if (pendingText.current) {
            typewriterQueue.current.push(...splitIntoWords(pendingText.current));
            pendingText.current = '';
        }
    }

    function startTypewriter() {
        if (typewriterInterval.current) return;
        lastTickTime.current = performance.now();
        wordBudget.current = 0;

        typewriterInterval.current = setInterval(() => {
            const now = performance.now();
            const elapsedSeconds = (now - lastTickTime.current) / 1000;
            lastTickTime.current = now;

            const backlog = typewriterQueue.current.length;
            if (backlog === 0) {
                // Don't "save up" time while waiting for the next chunk,
                // otherwise the next chunk would appear all at once.
                wordBudget.current = 0;
                return;
            }

            // Speed up when the backlog grows, so a fast provider
            // never leaves the text lagging far behind.
            const catchUpRate = backlog / MAX_LAG_SECONDS;
            const rate = Math.max(BASE_WORDS_PER_SECOND, catchUpRate);

            wordBudget.current += rate * elapsedSeconds;
            const count = Math.min(Math.floor(wordBudget.current), backlog);
            if (count === 0) return;

            wordBudget.current -= count;
            const chunk = typewriterQueue.current.splice(0, count).join('');
            setStreamingContent((prev) => prev + chunk);
        }, TICK_MS);
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
        pendingText.current = '';

        let response;
        try {
            response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
        } catch (networkErr) {
            // Network error reaching the backend itself, treat as termination.
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
                        // Not JSON after all, fall through and treat as a token.
                    }
                }

                collected.push(payload);
                enqueueText(payload);
            }
        }

        // Stream is over, so the held-back last word is complete now.
        flushPending();

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