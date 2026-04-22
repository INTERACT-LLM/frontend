import ChatMessage from '@/components/ChatMessage/ChatMessage';
import styles from './UserMessage.module.css';

export default function UserMessage({ content }) {
  return <ChatMessage content={content} className={styles.message} />;
}