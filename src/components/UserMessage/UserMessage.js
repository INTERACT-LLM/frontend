import ChatMessage from '@/components/ChatMessage/ChatMessage';
import styles from './UserMessage.module.css';

export default function UserMessage({ content }) {
  const normalized = content.replace(/\n/g, '  \n'); // two spaces + newline = Markdown line break
  return <ChatMessage content={normalized} className={styles.message} />;
}