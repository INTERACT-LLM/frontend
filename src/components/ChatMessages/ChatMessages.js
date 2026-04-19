import React from 'react';
import styles from './ChatMessages.module.css';
import ChatMessage from '@/components/ChatMessage/ChatMessage';

export default function ChatMessages({ messages, isLoading }) {
    const bottomRef = React.useRef(null);

    React.useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, isLoading]);

    return (
        <div className={styles.messages}>
            {messages.map((msg, i) => (
                <ChatMessage
                    key={i}
                    content={msg.content}
                    className={msg.role === 'user' ? styles.userMessage : styles.assistantMessage}
                />
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