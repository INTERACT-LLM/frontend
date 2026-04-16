import Link from "next/link";
import styles from "./Card.module.css";

export default function Card({ href, title, description }) {
  return (
    <Link href={href} className={styles.card}>
      <h2>{title}</h2>
      <p>{description}</p>
    </Link>
  );
}