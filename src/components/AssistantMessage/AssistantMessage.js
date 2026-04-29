import ChatMessage from '@/components/ChatMessage/ChatMessage';
import ImmediateFeedback from '@/components/ImmediateFeedback/ImmediateFeedback';
import styles from './AssistantMessage.module.css';

export default function AssistantMessage({ content, feedback, isStreaming }) {
  return (
    <ChatMessage content={content} className={styles.message}>
      {!isStreaming && <ImmediateFeedback feedback={feedback} />}
    </ChatMessage>
  );
}