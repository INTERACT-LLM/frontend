import Link from 'next/link';
import styles from './Header.module.css';
import UserMenu from '@/components/UserMenu/UserMenu';
import ModelStatusBanner from '@/components/ModelStatusBanner/ModelStatusBanner';

export default function Header() {
  return (
    <header className={styles.header}>
      <h1>
        <Link href="/">InteractLLM</Link>
      </h1>
      <div className={styles.controls}>
        <ModelStatusBanner />
        <UserMenu />
      </div>
    </header>
  );
}