import React from 'react';

export function useStreamingChat(chatEndpoint) {
    const [messages, setMessages] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
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
            const token = typewriterQueue.current.shift(); // 1 token at a time
            setStreamingContent((prev) => prev + token);
        }, TYPEWRITER_SPEED_MS);
    }

    function stopTypewriter() {
        if (typewriterInterval.current) {
            clearInterval(typewriterInterval.current);
            typewriterInterval.current = null;
        }
    }

    async function fetchChat(userMessage, sessionId, lessonId, selectedModel) {
        setIsLoading(true);
        setStreamingContent('');
        streamingContentRef.current = '';
        typewriterQueue.current = [];

        const response = await fetch(chatEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                session_id: sessionId,
                lesson_id: lessonId,
                model_id: selectedModel,
            }),
        });

        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
        setIsLoading(false);
        startTypewriter();

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const token = line.slice(6);
                if (token === '[DONE]') break;
                typewriterQueue.current.push(token);
            }
        }

        // Wait for queue to drain AND the ref to catch up with the last setState
        await new Promise((resolve) => {
            const check = setInterval(() => {
                if (typewriterQueue.current.length === 0) {
                    clearInterval(check);
                    // Extra tick to let the final setStreamingContent flush to the ref
                    setTimeout(resolve, TYPEWRITER_SPEED_MS * 2);
                }
            }, 50);
        });

        stopTypewriter();

        const final = streamingContentRef.current;
        setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...updated[updated.length - 1], content: final };
            return updated;
        });
        setStreamingContent('');

        return final;
    }

    return { messages, setMessages, isLoading, streamingContent, fetchChat };
}