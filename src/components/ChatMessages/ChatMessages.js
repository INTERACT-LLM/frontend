import React from 'react';
import styles from './ChatMessages.module.css';
import AssistantMessage from '@/components/AssistantMessage/AssistantMessage';
import UserMessage from '@/components/UserMessage/UserMessage';

const isAssistant = (msg) => msg.role === 'assistant';

export default function ChatMessages({ messages, isLoading }) {
    const bottomRef = React.useRef(null);

    React.useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, isLoading]);

    return (
        <div className={styles.messages}>
            {messages.map((msg, i) => (
            <div key={i} className={isAssistant(msg) ? styles.assistantRow : styles.userRow}>
                {isAssistant(msg)
                ? <AssistantMessage content={msg.content} feedback={msg.feedback} />
                : <UserMessage content={msg.content} />
                }
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