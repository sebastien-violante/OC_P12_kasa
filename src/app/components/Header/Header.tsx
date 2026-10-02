"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./Header.module.css";
import Link from "next/link";
import Cookies from "js-cookie";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import getRequest from "@/app/utils/getRequest";
import type { Conversation } from "@/app/types/types";

/**
 * Affiche l'en-tête principal de l'application.
 *
 * Adapte la navigation selon l'état d'authentification de l'utilisateur
 * et fournit un menu spécifique aux écrans mobiles.
 */
export default function Header() {
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { logout, user } = useAuth();
  const router = useRouter();

  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  /**
   * Ouvre ou ferme le menu de navigation mobile.
   */
  const expandMenu = () => {
    setMenuExpanded((prev) => !prev);
  };

  /**
   * Déconnecte l'utilisateur, ferme le menu et retourne à l'accueil.
   */
  function handleLogout() {
    logout();
    setMenuExpanded(false);
    router.push("/");
  }

  /**
   * Récupère le token d'authentification présent dans les cookies.
   */
  useEffect(() => {
    const storedToken = Cookies.get("token");
    setToken(storedToken ?? null);
  }, []);

  /**
   * Ferme le menu mobile lorsqu'un clic est effectué en dehors de celui-ci.
   */
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

  /**
   * Ferme le menu mobile avec la touche Échap et restitue le focus
   * au bouton d'ouverture du menu.
   */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuExpanded) {
        setMenuExpanded(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuExpanded]);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Navigation principale">
        {/* Navigation desktop */}
        <div className={styles.desktopMenu}>
          <ul className={styles.navItems}>
            <li>
              <Link href="/" className={styles.text}>
                Accueil
              </Link>
            </li>

            <li>
              <Link href="/a-propos" className={styles.text}>
                À propos
              </Link>
            </li>

            <li>
              <Link href="/" aria-label="Kasa, accueil">
                <img
                  src="/pictures/logo-kasa-full.svg"
                  alt=""
                  className={styles.logo}
                />
              </Link>
            </li>

            {user ? (
              <>
                <li>
                  <Link href="/ajouter-une-propriete" className={styles.button}>
                    Ajouter un logement
                  </Link>
                </li>

                <li className={styles.icon}>
                  <Link href="/mes-favoris" aria-label="Mes favoris">
                    <img src="/pictures/heart-nav.svg" alt="" />
                  </Link>
                </li>

                <li className={styles.icon}>
                  <Link href="/messagerie" aria-label="Mes messages">
                    <img src="/pictures/message-nav.svg" alt="" />
                  </Link>
                </li>

                <li className={styles.icon}>
                  <button
                    type="button"
                    onClick={handleLogout}
                    aria-label="Se déconnecter"
                    className={styles.navBtn}
                  >
                    <img src="/pictures/logout.png" alt="" />
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link href="/connexion" className={styles.button}>
                  Connexion
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Navigation mobile */}
        <div className={styles.mobileMenu} ref={menuRef}>
          <div className={styles.mobileHeader}>
            <Link href="/" aria-label="Kasa, accueil">
              <img
                src="/pictures/logo-kasa-small.svg"
                alt=""
                className={styles.logoMobile}
              />
            </Link>

            <button
              ref={menuButtonRef}
              type="button"
              onClick={expandMenu}
              aria-expanded={menuExpanded}
              aria-controls="mobile-navigation"
              aria-label={menuExpanded ? "Fermer le menu" : "Ouvrir le menu"}
            >
              <img
                src={`/pictures/${menuExpanded ? "cross" : "burger"}.svg`}
                alt=""
                aria-hidden="true"
              />
            </button>
          </div>

          <div id="mobile-navigation" hidden={!menuExpanded}>
            <ul className={styles.expanded}>
              <li>
                <Link href="/" className={styles.text}>
                  Accueil
                </Link>
              </li>

              <li>
                <Link href="/a-propos" className={styles.text}>
                  À propos
                </Link>
              </li>

              {user ? (
                <>
                  <li>
                    <Link href="/messagerie">Messagerie</Link>
                  </li>

                  <li>
                    <Link href="/mes-favoris">Favoris</Link>
                  </li>

                  <li>
                    <Link href="/ajouter-une-propriete">
                      Ajouter un logement
                    </Link>
                  </li>

                  <li>
                    <button type="button" onClick={handleLogout}>
                      Déconnexion
                    </button>
                  </li>
                </>
              ) : (
                <li>
                  <Link href="/connexion">Connexion</Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}