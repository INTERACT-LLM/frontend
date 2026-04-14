import Link from "next/link";
import styles from "./LandingPage.module.css";

export default function LandingPage() {
  return (
    <main className={styles.wrapper}>
      <h1 className={styles.title}>Hola Mina!</h1>
      <h2 className={styles.subtitle}>Begin learning Spanish with a game or a roleplaying scenario!</h2>

      <div className={styles.cardRow}>
        <Link href="/chat/general" className={styles.card}>
          <h2>💬 General Chat</h2>
          <p>Ask anything, casual conversation and help</p>
        </Link>

        <Link href="/chat/code" className={styles.card}>
          <h2>💻 Code Chat</h2>
          <p>Programming help, debugging, explanations</p>
        </Link>
      </div>
    </main>
  );
}