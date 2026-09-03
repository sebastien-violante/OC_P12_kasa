import styles from './Footer.module.css'

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <img alt="Logo du site Kasa" src="pictures/logo-kasa-small.svg" />
            <p>© 2026 Kasa. All rights reserved</p>
        </footer>

    )
}