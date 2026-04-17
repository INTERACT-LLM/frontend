import AssistantMessage from '@/components/AssistantMessage/AssistantMessage';
import UserMessage from '@/components/UserMessage/UserMessage';
import React from 'react';

export default function ChatMessages({ messages }) {
    const lastUserRef = React.useRef(null);

    const lastUserIndex = React.useMemo(
        () => messages.map(m => m.role).lastIndexOf('user'),
        [messages]
    );

    React.useLayoutEffect(() => {
        if (!lastUserRef.current) return;
        requestAnimationFrame(() => {
            lastUserRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
        });
    }, [messages]);

    return (
        <div>
            {messages.map((msg, i) => (
                <div key={i} ref={i === lastUserIndex ? lastUserRef : null}>
                    {msg.role === 'assistant' ? (
                        <AssistantMessage content={msg.content} />
                    ) : (
                        <UserMessage content={msg.content} />
                    )}
                </div>
            ))}
        </div>
    );
}