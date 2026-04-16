import styles from "./LandingPage.module.css";
import LessonGrid from "@/components/LessonGrid/LessonGrid";

export default function LandingPage() {
  return (
    <main className={styles.wrapper}>
      <h1 className={styles.title}>Hola Mina!</h1>
      <h2 className={styles.subtitle}>Begin learning Spanish with a game or a roleplaying scenario!</h2>
      <LessonGrid />
    </main>
  );
}