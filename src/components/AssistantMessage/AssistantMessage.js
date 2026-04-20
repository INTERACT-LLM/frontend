import ChatMessage from '@/components/ChatMessage/ChatMessage';
import ImmediateFeedback from '@/components/ImmediateFeedback/ImmediateFeedback';

import styles from './AssistantMessage.module.css';

export default function AssistantMessage({ content, feedback }) {
  const hasFeedback = feedback?.has_error && feedback?.corrected_text;

  return (
    <ChatMessage content={content} className={styles.message}>
      {hasFeedback && <ImmediateFeedback feedback={feedback} />}
    </ChatMessage>
  );
}