import ChatMessage from "@/components/ChatMessage/ChatMessage";
import styles from "./UserMessage.module.css";

export default function UserMessage({ content }) {
  return (
    <ChatMessage
      content={content}
      rowClassName={styles.row}
      bubbleClassName={styles.bubble}
    />
  );
}