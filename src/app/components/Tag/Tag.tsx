import styles from './Tag.module.css'

type TagProps = {
  item: string;
  select: boolean;
  onToggle?: (tag: string) => void;
  selected?: boolean;
};

export default function Tag({
  item,
  select,
  onToggle,
  selected = false,
}: TagProps) {

  return (
    <button
      type="button"
      className={`${styles.span} ${!select && selected ? styles.selected : ""}`}
      onClick={() => !select && onToggle?.(item)}
    >
      {item}
    </button>
  );
}