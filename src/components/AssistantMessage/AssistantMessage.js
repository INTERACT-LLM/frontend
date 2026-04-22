import ChatMessage from '@/components/ChatMessage/ChatMessage';
import ImmediateFeedback from '@/components/ImmediateFeedback/ImmediateFeedback';

import styles from './AssistantMessage.module.css';

export default function AssistantMessage({ content, feedback }) {
  console.log('AssistantMessage feedback:', feedback);
  return (
    <ChatMessage content={content} className={styles.message}>
      {<ImmediateFeedback feedback={feedback} />}
    </ChatMessage>
  );
}