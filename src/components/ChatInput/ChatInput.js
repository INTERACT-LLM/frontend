import { Send } from "lucide-react";
import styles from './ChatInput.module.css';
import React from 'react';

export default function ChatInput({ submitNewMessage, newMessage = '', setNewMessage, disabled }) {
    const textareaRef = React.useRef(null);

    // re-focus whenever disabled flips back to false (i.e. response arrived)
    React.useEffect(() => {
        if (!disabled) {
            textareaRef.current?.focus();
        }
    }, [disabled]);

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitNewMessage(e);
        }
    }

    return (
        <div className={styles.inputRow}>
            <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage?.(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message… (Shift+Enter for new line)"
                className={styles.input}
                rows={1}
                disabled={disabled}
            />
            <button
                type="button"
                onClick={submitNewMessage}
                disabled={disabled || !newMessage.trim()}
                className={styles.button}
            >
                <Send size={15} />
            </button>
        </div>
    );
}