import { Message } from "@/app/types/types";
import styles from "./MessageTile.module.css";
import { useAuth } from "@/app/context/AuthContext";

type MessageTileProps = {
    message: Message
}

export default function MessageTile({message}: MessageTileProps) {
    const { user } = useAuth()
    const additiveClassName = (message.sender.id === user?.id) ? styles.self : ""
  return (
    <div className={`${styles.messageWrapper} ${additiveClassName}`}>
      <div className={styles.square}></div>
      <div className={styles.message}>
        <div className={styles.horodatage}>
            <div className={styles.user}>{message.sender.name}</div>
            <div className={styles.point}></div>
            <div className={styles.hour}>11:04pm</div>
        </div>
        <div className={`${styles.messageContent} ${additiveClassName}`}>{message.content}</div>
      </div>
    </div>
  );
}
