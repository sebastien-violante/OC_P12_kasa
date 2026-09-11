"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";
import Link from "next/link";
import Cookies from "js-cookie";

export default function Header() {
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null); // reférence pour détecter un clic hors du menu et le refermer
  const expandMenu = () => {
    setMenuExpanded((prev) => !prev);
  };

  useEffect(() => {
    setToken(token);
    console.log(token);
  }, []);

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
              <Link href="/a-propos" className={styles.text}>
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

            {token && (
              <>
                <li>
                  <Link href="/ajouter-une-propriete" className={styles.button}>
                    +Ajouter un logement
                  </Link>
                </li>
                <li className={styles.icon}>
                  <Link href="/mes-favoris" aria-label="Mes favoris">
                    <img src="/pictures/heart-nav.svg" alt="" />
                  </Link>
                </li>
                <li className={styles.icon}>
                  <Link href="/" aria-label="Mes messages">
                    <img src="/pictures/message-nav.svg" alt="" />
                  </Link>
                </li>
                <li className={styles.icon}>
                  <Link href="/" aria-label="Déconnexion">
                    <img src="/pictures/cross.svg" alt="" />
                  </Link>
                </li>
              </>
            )}
            {!token && (
              <Link href="/connexion" className={styles.button}>
                Connexion
              </Link>
            )}
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
              <img
                src={`/pictures/${menuExpanded ? "cross" : "burger"}.svg`}
                alt="ouverture/fermeture du menu"
              />
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
              {token && (
                <>
                <li>
                <Link href="/messages" aria-label="Mes messages">
                  Messagerie
                </Link>
              </li>
              <li>
                <Link href="/mes-favoris" aria-label="Mes favoris">
                  Favoris
                </Link>
              </li>
              <li>
                <Link href="/ajouter-une-propriete" aria-label="Ajouter un logement">
                  Ajouter un logement
                </Link>
              </li>
              <li>
                <Link href="/" aria-label="Déconnexion">
                  Déconnexion
                </Link>
              </li>
                </>
              )}
              {!token && (
                <li>
                <Link href="/connexion" aria-label="Déconnexion">
                  Connexion
                </Link>
              </li>
              )}
              
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
}
