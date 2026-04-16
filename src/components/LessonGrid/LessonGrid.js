import Card from "@/components/Card/Card";
import styles from "./LessonGrid.module.css";

export default function LessonGrid() {
  return (
    <div className={styles.grid}>
      <Card href="/chat/general" title="💬 General Chat" description="Ask anything, casual conversation and help" />
      <Card href="/chat/code" title="💻 Code Chat" description="Programming help, debugging, explanations" />
    </div>
  );
}