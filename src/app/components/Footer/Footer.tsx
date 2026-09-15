import styles from './Footer.module.css'

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <img alt="Kasa" src="/pictures/logo-kasa-small.svg" />
            <p>© 2026 Kasa. Tous droits réservés</p>
        </footer>

    )
}