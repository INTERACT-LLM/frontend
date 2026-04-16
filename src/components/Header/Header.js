import Link from 'next/link';
import React from 'react';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <h1>
        <Link href="/">InteractLLM</Link>
      </h1>
    </header>
  );
}
