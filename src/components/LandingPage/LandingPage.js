import Link from "next/link";
import styles from "./LandingPage.module.css";

export default function LandingPage() {
  return (
    <main className={styles.wrapper}>
      <p className={styles.greeting}>Hola Mina 👋</p>
      <h1 className={styles.title}>
        Ready to practice your <span className={styles.accent}>Spanish</span> today?
      </h1>
      <p className={styles.subtitle}>
        Pick a game or jump into a scenario. There's no
        wrong way to start. Every session counts, even the short ones.
      </p>
      <Link href="/lessons" className={styles.cta}>
        See today's lessons →
      </Link>
    </main>
  );
}