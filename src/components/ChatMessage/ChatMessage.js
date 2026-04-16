import styles from './ChatMessage.module.css';

export default function Message({
  content,
  bubbleClassName = '',
  rowClassName = '',
}) {
  return (
    <div className={`${styles.row} ${rowClassName}`}>
      <div className={`${styles.bubble} ${bubbleClassName}`}>
        {content}
      </div>
    </div>
  );
}