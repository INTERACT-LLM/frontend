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
      <h1>
        <Link href="/">InteractLLM</Link>
      </h1>
      <div className={styles.controls}>
        {pathname !== '/' && <ModelStatusBanner />}
        <UserMenu />
      </div>
    </header>
  );
}