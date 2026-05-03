'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Header.module.css';
import UserMenu from '@/components/UserMenu/UserMenu';
import ModelStatusBanner from '@/components/ModelStatusBanner/ModelStatusBanner';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const lessonsActive = pathname.startsWith('/lessons') || (pathname.startsWith('/chat') && pathname !== '/chat/free');
  const freeActive = pathname === '/chat/free';

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
            className={`${styles.navLink} ${lessonsActive ? styles.navLinkActive : ''}`}
          >
            Lessons
          </Link>
          <button
            onClick={() => router.push('/chat/free?setup=true')}
            className={`${styles.navLink} ${freeActive ? styles.navLinkActive : ''}`}
          >
            Free Practice
          </button>
        </nav>
      </div>
      <div className={styles.controls}>
        <ModelStatusBanner />
        <UserMenu />
      </div>
    </header>
  );
}