import { Send } from "lucide-react";
import styles from './ChatInput.module.css';

export default function ChatInput({ submitNewMessage, newMessage = '', setNewMessage }) {
    return (
        <form onSubmit={submitNewMessage} className={styles.inputRow}>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage?.(e.target.value)}
                placeholder="Type a message..."
                className={styles.input}
            />

            <button type="submit" className={styles.button}>
                <Send size={16} />
            </button>
            </form>
    );
}