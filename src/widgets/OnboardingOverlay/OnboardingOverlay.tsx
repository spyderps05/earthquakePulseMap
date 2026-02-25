import { useCallback, useEffect, useState } from "react";
import styles from "./OnboardingOverlay.module.scss";

const ONBOARDING_KEY = "gimu-eq-onboarding-seen";

export default function OnboardingOverlay() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const seen = localStorage.getItem(ONBOARDING_KEY);
        if (!seen) {
            setVisible(true);
        }
    }, []);

    const dismiss = useCallback(() => {
        setVisible(false);
        localStorage.setItem(ONBOARDING_KEY, "1");
    }, []);

    if (!visible) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.card}>
                <h2 className={styles.heading}>Welcome to GIMU-EarthQuake Watch</h2>
                <p className={styles.subtitle}>
                    Interactive 3D globe visualizing global seismic activity
                </p>

                <div className={styles.tips}>
                    <div className={styles.tip}>
                        <span className={styles.tipIcon}>🌍</span>
                        <span>
                            <strong>Rotate & Zoom</strong> — Click and drag to rotate. Scroll
                            to zoom.
                        </span>
                    </div>
                    <div className={styles.tip}>
                        <span className={styles.tipIcon}>▶</span>
                        <span>
                            <strong>Play/Pause</strong> — Watch earthquakes unfold over time
                            from 1900 to 2026.
                        </span>
                    </div>
                    <div className={styles.tip}>
                        <span className={styles.tipIcon}>⚡</span>
                        <span>
                            <strong>Speed</strong> — Cycle through 0.25x to 4x playback
                            speeds.
                        </span>
                    </div>
                    <div className={styles.tip}>
                        <span className={styles.tipIcon}>ALL</span>
                        <span>
                            <strong>Show All</strong> — Display all earthquakes simultaneously.
                        </span>
                    </div>
                    <div className={styles.tip}>
                        <span className={styles.tipIcon}>📅</span>
                        <span>
                            <strong>Modes</strong> — Switch between Historic (1900–2026) and
                            Last 7 Days live data.
                        </span>
                    </div>
                    <div className={styles.tip}>
                        <span className={styles.tipIcon}>⚙</span>
                        <span>
                            <strong>Filters</strong> — Filter by magnitude and depth ranges.
                        </span>
                    </div>
                </div>

                <button type="button" className={styles.dismissBtn} onClick={dismiss}>
                    Got it — Let me explore!
                </button>
            </div>
        </div>
    );
}
