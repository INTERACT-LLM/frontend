import ChatMessage from "@/components/ChatMessage/ChatMessage";
import styles from "./AssistantMessage.module.css";


export default function AssistantMessage({ content }) {
  const avatar = (
    <div className={styles.avatar}>AI</div>
  );

  return (
    <ChatMessage
      content={content}
      bubbleClassName={styles.bubble}
      avatar={avatar}
    />
  );
}