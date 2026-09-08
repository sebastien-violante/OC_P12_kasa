import styles from './Tag.module.css'

type TagProps = {
  item: string;
};

export default function Tag({ item }: TagProps) {
  return (
    <span className={styles.span}>
      {item}
    </span>
  );
}