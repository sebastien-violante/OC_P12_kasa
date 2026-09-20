import styles from "./ConversationTile.module.css";
import formatHour from "@/app/utils/formatHour";

type ConversationTileProps = {
  id: number;
  user: string;
  message?: string;
  date?: string;
  setSelectedConversationId: (id: number) => void;
  unreadCount: number;
};

export default function ConversationTile({
  user,
  message,
  date,
  setSelectedConversationId,
  id,
  unreadCount,
}: ConversationTileProps) {
  return (
    <article
      className={styles.conversationTile}
      onClick={() => setSelectedConversationId(id)}
    >
      <div className={styles.square}></div>
      <div className={styles.data}>
        <p className={styles.user}>{user}</p>
        <p className={styles.message}>{message}</p>
      </div>
      <div className={styles.date}>
        <p className={styles.hour}>{date ? formatHour(date) : ""}</p>
        {unreadCount > 0 && <div className={styles.redBubble}></div>}
      </div>
    </article>
  );
}
