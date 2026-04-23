import Link from "next/link";
import styles from "./Card.module.css";

export default function Card({ href, onClick, title, description }) {
  if (href) {
    return (
      <Link href={href} className={styles.card}>
        <h2>{title}</h2>
        <p>{description}</p>
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={styles.card}>
      <h2>{title}</h2>
      <p>{description}</p>
    </button>
  );
}