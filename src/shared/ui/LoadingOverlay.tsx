import styles from "./LoadingOverlay.module.scss";

interface Props {
    message?: string;
}

export default function LoadingOverlay({
    message = "Loading seismic data…",
}: Props) {
    return (
        <div className={styles.overlay}>
            <div className={styles.content}>
                <div className={styles.pulseRing}>
                    <div className={styles.ring1} />
                    <div className={styles.ring2} />
                    <div className={styles.ring3} />
                    <div className={styles.dot} />
                </div>
                <p className={styles.message}>{message}</p>
            </div>
        </div>
    );
}
