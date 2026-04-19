import Markdown from 'react-markdown';
import styles from './ChatMessage.module.css';

export default function ChatMessage({ content, className = '' }) {
  return (
    <div className={`${styles.message} ${className}`}>
      <Markdown>{content}</Markdown>
    </div>
  );
}