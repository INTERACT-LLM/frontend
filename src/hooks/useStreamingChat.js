import React from 'react';

export function useStreamingChat(chatEndpoint) {
    const [messages, setMessages] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

    async function fetchChat(userMessage, sessionId, lessonId, selectedModel) {
        setIsLoading(true);

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

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        const collected = [];
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

                collected.push(token);
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                        ...updated[updated.length - 1],
                        content: collected.join(''),
                    };
                    return updated;
                });
            }
        }

        return collected.join('');
    }

    return { messages, setMessages, isLoading, fetchChat };
}