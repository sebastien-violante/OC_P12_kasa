import styles from "./Header.module.css";
import Link from "next/link";

export default function Header() {
  return (
    <header className={styles.header}>
      <nav 
        className={styles.nav}
        aria-label="Navigation principale"
        >
        <ul className={styles.navItems}>
          <li>
            <Link href="#">Acceuil</Link>
          </li>
          <li>
            <Link href="#">A propos</Link>
          </li>
        </ul>
        <Link href="/" aria-label="Kasa - Accueil">
          <img
            src="/pictures/logo-kasa-full.svg"
            alt=""
            className={styles.logo}
          />
        </Link>
        <Link href="#">+Ajouter un logement</Link>
      </nav>
    </header>
  );
}
