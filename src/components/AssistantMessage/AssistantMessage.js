import ChatMessage from "@/components/ChatMessage/ChatMessage";
import styles from "./AssistantMessage.module.css";


export default function AssistantMessage({ content }) {
  return (
    <ChatMessage
      content={content}
      bubbleClassName={styles.bubble}
    />
  );
}