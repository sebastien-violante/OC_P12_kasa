import styles from "./Loader.module.css";

export default function Loader() {
  return (
    <div className={`${styles.loader} flex items-center gap-2`}>
      <span className={`${styles.square} ${styles.delay1}`} />
      <span className={`${styles.square} ${styles.delay2}`} />
      <span className={`${styles.square} ${styles.delay3}`} />
      <span className={`${styles.square} ${styles.delay4}`} />
    </div>
  );
}
