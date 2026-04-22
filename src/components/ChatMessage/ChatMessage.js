import Markdown from 'react-markdown';
import styles from './ChatMessage.module.css';

export default function ChatMessage({ content, children, className = '' }) {
  const bubbleClassName = [styles.message, className].filter(Boolean).join(' ');

  return (
    <div className={bubbleClassName}>
      <Markdown>{content}</Markdown>
      {children}
    </div>
  );
}