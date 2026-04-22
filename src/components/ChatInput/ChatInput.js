import { Send } from "lucide-react";
import styles from './ChatInput.module.css';
import React from 'react';

export default function ChatInput({ onSubmit, disabled }) {
    const [newMessage, setNewMessage] = React.useState('');
    const textareaRef = React.useRef(null);

    React.useEffect(() => {
        if (!disabled) {
            textareaRef.current?.focus();
        }
    }, [disabled]);

    function handleSubmit() {
        if (!newMessage.trim() || disabled) return;
        onSubmit(newMessage);
        setNewMessage('');
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    return (
        <div className={styles.inputRow}>
            <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message… (Shift+Enter for new line)"
                className={styles.input}
                rows={1}
                disabled={disabled}
            />
            <button
                type="button"
                onClick={handleSubmit}
                disabled={disabled || !newMessage.trim()}
                className={styles.button}
            >
                <Send size={15} />
            </button>
        </div>
    );
}