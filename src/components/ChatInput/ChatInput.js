import { Send } from "lucide-react";
import styles from './ChatInput.module.css';

export default function ChatInput({ submitNewMessage, newMessage = '', setNewMessage, disabled }) {
    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitNewMessage(e);
        }
    }

    return (
        <div className={styles.inputRow}>
            <textarea
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