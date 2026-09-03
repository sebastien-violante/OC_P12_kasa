import styles from "./not-found.module.css";
import Link from "next/link";

export default function notFound() {
  return (
    <section className={styles.notfound}>
      
        <h1>404</h1>
        <p>Il semble que la page que vous cherchez ait pris <br/> des vacances… ou n’ait jamais existé.</p>
        <Link className={styles.link} href="/">Accueil</Link>
        <Link className={styles.link} href="/">Logements</Link>
    </section>
  );
}
