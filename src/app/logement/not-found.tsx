import styles from './not-found.module.css'
import Link from "next/link";

export default function notFound() {
  return (
    <section className={styles.notfound}>
      <img src="/pictures/broken-house.png" alt=""/>
      <p>
        Nous sommes désolés mais cette propriété n&apos;est pas disponible !
      </p>
      <Link className={styles.link} href="/">
        Accueil
      </Link>
      <Link className={styles.link} href="/">
        Logements
      </Link>
    </section>
  );
}
