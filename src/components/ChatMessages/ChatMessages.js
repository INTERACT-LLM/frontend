import React from 'react';
import styles from './ChatMessages.module.css';

import AssistantMessage from '@/components/AssistantMessage/AssistantMessage';
import UserMessage from '@/components/UserMessage/UserMessage';

export default function ChatMessages({ messages, isLoading }) {
    const bottomRef = React.useRef(null);

    React.useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, isLoading]);

    return (
        <div>
            {messages.map((msg, i) => (
                <div key={i}>
                    {msg.role === 'assistant' ? (
                        <AssistantMessage content={msg.content} />
                    ) : (
                        <UserMessage content={msg.content} />
                    )}
                </div>
            ))}

            {isLoading && (
                <div className={styles.typingRow}>
                    <div className={styles.typingBubble}>
                        <span className={styles.dot} />
                        <span className={styles.dot} />
                        <span className={styles.dot} />
                    </div>
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    );
}