'use client';
import Link from "next/link";
import styles from "./LandingPage.module.css";
import { useUser } from "@/context/UserContext";

export default function LandingPage() {
  const { user } = useUser();
  const firstName = user?.name?.split(' ')?.[0] || '';
  const language = user?.learningLanguage || 'Spanish';

  return (
    <main className={styles.wrapper}>
      {firstName && <p className={styles.greeting}>Hola {firstName} 👋</p>}
      <h1 className={styles.title}>
        Ready to practice your <span className={styles.accent}>{language}</span> today?
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