import styles from "./page.module.css";
import Image from "next/image";

export default function About() {
  return (
    <>
      <section className={styles.header}>
        <h1>À propos</h1>
        <div className={styles.description}>
          <p>
            Chez Kasa, nous croyons que chaque voyage mérite un lieu unique où
            se sentir bien.
          </p>
          <p>
            Depuis notre création, nous mettons en relation des voyageurs en
            quête d’authenticité avec des hôtes passionnés qui aiment partager
            leur région et leurs bonnes adresses.
          </p>
        </div>
        <div className={styles.pictureWrapper}>
          <Image
            src="/pictures/about1.png"
            fill
            alt=""
            className={styles.img}
          />
        </div>
      </section>
      <section className={styles.mission}>
        <div className={styles.left}>
          <div className={styles.items}>
            <h2>Notre mission est simple :</h2>
            <ol>
              <li>Offrir une plateforme fiable et simple d’utilisation</li>
              <li>Proposer des hébergements variés et de qualité</li>
              <li>
                Favoriser des échanges humains et chaleureux entre hôtes et
                voyageurs
              </li>
            </ol>
          </div>
          <div className={styles.slogan}>
            Que vous cherchiez un appartement cosy en centre-ville, une maison
            en bord de mer ou un chalet à la montagne, Kasa vous accompagne pour
            que chaque séjour devienne un souvenir inoubliable.
          </div>
        </div>

        <div className={styles.pictureWrapper}>
          <Image fill src="/pictures/about2.png" alt="" />
        </div>
      </section>
    </>
  );
}
