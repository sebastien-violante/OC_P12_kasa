import styles from "./Tag.module.css";

type TagProps = {
  item: string;
  select: boolean;
  onToggle?: (tag: string) => void;
  selected?: boolean;
};

/**
 * Affiche un tag sélectionnable.
 *
 * Lorsque le mode sélection est désactivé, le clic permet de modifier
 * l'état du tag via le callback fourni.
 *
 * @param item - Libellé du tag à afficher.
 * @param select - Indique si le tag est en mode sélection.
 * @param onToggle - Fonction appelée lors du clic sur le tag.
 * @param selected - Indique si le tag est actuellement sélectionné.
 */
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