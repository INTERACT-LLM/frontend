import React from 'react';
import styles from './ChatMessages.module.css';
import AssistantMessage from '@/components/AssistantMessage/AssistantMessage';
import UserMessage from '@/components/UserMessage/UserMessage';

const isAssistant = (msg) => msg.role === 'assistant';

export default function ChatMessages({ messages, feedbacks, isLoading, streamingContent = '' }) {
    const bottomRef = React.useRef(null);

    React.useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, isLoading, streamingContent]);

    const feedbackByIndex = React.useMemo(() => {
        const map = {};
        let userIdx = 0;
        messages.forEach((msg, i) => {
            if (msg.role === 'user') {
                // find the assistant message that follows this user message
                const nextAssistantIdx = messages.findIndex(
                    (m, j) => j > i && m.role === 'assistant'
                );
                if (nextAssistantIdx !== -1) {
                    map[nextAssistantIdx] = feedbacks[userIdx];
                }
                userIdx++;
            }
        });
        return map;
    }, [messages, feedbacks]);

    return (
        <div className={styles.messages}>
            {messages.map((msg, i) => {
                const isLast = i === messages.length - 1;
                const isStreaming = isLast && isAssistant(msg) && !!streamingContent;
                const content = isStreaming ? streamingContent : msg.content;

                return (
                    <div key={i} className={isAssistant(msg) ? styles.assistantRow : styles.userRow}>
                        {isAssistant(msg)
                            ? <AssistantMessage
                                content={content}
                                feedback={feedbackByIndex[i]?.feedback}
                                isStreaming={isStreaming}
                              />
                            : <UserMessage content={msg.content} />
                        }
                    </div>
                );
            })}

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