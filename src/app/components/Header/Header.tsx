"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";
import Link from "next/link";

export default function Header() {
  const [menuExpanded, setMenuExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null); // reférence pour détecter un clic hors du menu et le refermer
  const expandMenu = () => {
    setMenuExpanded((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Navigation principale">
        <div className={styles.desktopMenu}>
          <ul className={styles.navItems}>
            <li>
              <Link href="/" className={styles.text}>
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/about" className={styles.text}>
                A propos
              </Link>
            </li>
            <li>
              <Link href="/" aria-label="Kasa - Accueil">
                <img
                  src="/pictures/logo-kasa-full.svg"
                  alt=""
                  className={styles.logo}
                />
              </Link>
            </li>
            <li>
              <Link href="/add-property" className={styles.button}>
                +Ajouter un logement
              </Link>
            </li>
            <li className={styles.icon}>
              <Link href="/favorites" aria-label="Mes favoris">
                <img src="/pictures/heart-nav.svg" alt="" />
              </Link>
            </li>
            <li className={styles.icon}>
              <Link href="/" aria-label="Mes messages">
                <img src="/pictures/message-nav.svg" alt="" />
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.mobileMenu} ref={menuRef}>
          <div className={styles.header}>
            <img
              src="/pictures/logo-kasa-small.svg"
              alt="Accueil du site Kasa"
              className={styles.logoMobile}
            />
            <button onClick={expandMenu}>
              <img src={`/pictures/${menuExpanded ? "cross" : "burger"}.svg`} />
            </button>
          </div>

          {menuExpanded && (
            <ul className={styles.expanded}>
              <li>
                <Link href="/" className={styles.text}>
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/about" className={styles.text}>
                  A propos
                </Link>
              </li>
              <li>
                <Link href="/messages" aria-label="Mes messages">
                  Messagerie
                </Link>
              </li>
              <li>
                <Link href="/favorites" aria-label="Mes favoris">
                  Favoris
                </Link>
              </li>
              <li>
                <Link href="/add-property" aria-label="Mes favoris">
                  Ajouter un logement
                </Link>
              </li>
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
}
