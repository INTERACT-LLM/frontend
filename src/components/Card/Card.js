import Link from "next/link";
import styles from "./Card.module.css";

export default function Card({ href, onClick, title, description, badgeVariant }) {
  const cardClass = `${styles.card} ${badgeVariant ? styles[`card_${badgeVariant}`] : ''}`;

  const content = (
    <>
      <h2>{title}</h2>
      <p>{description}</p>
    </>
  );

  if (href) {
    return <Link href={href} className={cardClass}>{content}</Link>;
  }

  return (
    <button type="button" onClick={onClick} className={cardClass}>
      {content}
    </button>
  );
}