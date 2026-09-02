import styles from './Tile.module.css'

type TileProps = {
    title: string;
    description: string;
}

export default function Tile({title, description}: TileProps) {
    return (
        <div className={styles.tile}>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    )
}