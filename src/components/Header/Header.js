'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import UserMenu from '@/components/UserMenu/UserMenu';
import ModelStatusBanner from '@/components/ModelStatusBanner/ModelStatusBanner';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1>
          <Link href="/">InteractLLM</Link>
        </h1>
        <div className={styles.divider} />
        <nav className={styles.nav}>
          <Link
            href="/lessons"
            className={`${styles.navLink} ${pathname.startsWith('/lessons') || pathname.startsWith('/chat') ? styles.navLinkActive : ''}`}
          >
            Lessons
          </Link>
          <Link
            href="/chat/free"
            className={`${styles.navLink} ${pathname === '/chat/free' ? styles.navLinkActive : styles.navLinkFree}`}
          >
            Free Practice
          </Link>
        </nav>
      </div>
      <div className={styles.controls}>
        <ModelStatusBanner />
        <UserMenu />
      </div>
    </header>
  );
}