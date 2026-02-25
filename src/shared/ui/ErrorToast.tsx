import { useCallback, useEffect, useState } from "react";
import styles from "./ErrorToast.module.scss";

interface Props {
    message: string;
    onRetry?: () => void;
    onDismiss?: () => void;
}

export default function ErrorToast({ message, onRetry, onDismiss }: Props) {
    const [visible, setVisible] = useState(true);

    const dismiss = useCallback(() => {
        setVisible(false);
        onDismiss?.();
    }, [onDismiss]);

    useEffect(() => {
        const timer = setTimeout(dismiss, 10_000);
        return () => clearTimeout(timer);
    }, [dismiss]);

    if (!visible) return null;

    return (
        <div className={styles.toast} role="alert">
            <span className={styles.icon}>⚠</span>
            <p className={styles.message}>{message}</p>
            {onRetry && (
                <button
                    type="button"
                    className={styles.retryBtn}
                    onClick={onRetry}
                >
                    Retry
                </button>
            )}
            <button
                type="button"
                className={styles.closeBtn}
                onClick={dismiss}
                aria-label="Dismiss error"
            >
                ✕
            </button>
        </div>
    );
}
