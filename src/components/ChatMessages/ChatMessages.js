import React from 'react';
import styles from './ChatMessages.module.css';
import AssistantMessage from '@/components/AssistantMessage/AssistantMessage';
import UserMessage from '@/components/UserMessage/UserMessage';

const isAssistant = (msg) => msg.role === 'assistant';

export default function ChatMessages({ messages, feedbacks, isLoading }) {
    const bottomRef = React.useRef(null);

    React.useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, isLoading]);

    // pre-map each message index to its feedback
    const feedbackByIndex = React.useMemo(() => {
        const map = {};
        let assistantIdx = 0;
        messages.forEach((msg, i) => {
            if (msg.role === 'assistant') {
                map[i] = feedbacks[assistantIdx++];
            }
        });
        return map;
    }, [messages, feedbacks]);

    return (
        <div className={styles.messages}>
            {messages.map((msg, i) => (
                <div key={i} className={isAssistant(msg) ? styles.assistantRow : styles.userRow}>
                    {isAssistant(msg)
                        ? <AssistantMessage
                            content={msg.content}
                            feedback={feedbackByIndex[i]?.feedback}
                          />
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