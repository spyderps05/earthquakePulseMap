import { useCallback, useState } from "react";
import { useTime } from "@/shared/context/TimeContext";
import styles from "./FilterPanel.module.scss";

export default function FilterPanel() {
    const { mode } = useTime();
    const [isOpen, setIsOpen] = useState(false);
    const [magRange, setMagRange] = useState<[number, number]>(
        mode === "week" ? [2.5, 10] : [6, 10],
    );
    const [depthRange, setDepthRange] = useState<[number, number]>([0, 700]);

    const toggleOpen = useCallback(() => setIsOpen((p) => !p), []);

    const magMin = mode === "week" ? 2.5 : 6;

    return (
        <div className={styles.wrapper}>
            <button
                type="button"
                className={`${styles.toggleBtn} ${isOpen ? styles.active : ""}`}
                onClick={toggleOpen}
                aria-label="Toggle earthquake filters"
                title="Filter earthquakes"
            >
                <span className={styles.filterIcon}>⚙</span>
            </button>

            {isOpen && (
                <div className={styles.panel}>
                    <h4 className={styles.title}>Filters</h4>

                    <div className={styles.filterGroup}>
                        <label className={styles.label}>
                            Magnitude: {magRange[0].toFixed(1)} — {magRange[1].toFixed(1)}
                        </label>
                        <div className={styles.sliderRow}>
                            <input
                                type="range"
                                min={magMin}
                                max={10}
                                step={0.1}
                                value={magRange[0]}
                                onChange={(e) =>
                                    setMagRange([
                                        Math.min(Number(e.target.value), magRange[1]),
                                        magRange[1],
                                    ])
                                }
                                className={styles.slider}
                                aria-label="Minimum magnitude"
                            />
                            <input
                                type="range"
                                min={magMin}
                                max={10}
                                step={0.1}
                                value={magRange[1]}
                                onChange={(e) =>
                                    setMagRange([
                                        magRange[0],
                                        Math.max(Number(e.target.value), magRange[0]),
                                    ])
                                }
                                className={styles.slider}
                                aria-label="Maximum magnitude"
                            />
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.label}>
                            Depth: {depthRange[0].toFixed(0)} — {depthRange[1].toFixed(0)} km
                        </label>
                        <div className={styles.sliderRow}>
                            <input
                                type="range"
                                min={0}
                                max={700}
                                step={10}
                                value={depthRange[0]}
                                onChange={(e) =>
                                    setDepthRange([
                                        Math.min(Number(e.target.value), depthRange[1]),
                                        depthRange[1],
                                    ])
                                }
                                className={styles.slider}
                                aria-label="Minimum depth"
                            />
                            <input
                                type="range"
                                min={0}
                                max={700}
                                step={10}
                                value={depthRange[1]}
                                onChange={(e) =>
                                    setDepthRange([
                                        depthRange[0],
                                        Math.max(Number(e.target.value), depthRange[0]),
                                    ])
                                }
                                className={styles.slider}
                                aria-label="Maximum depth"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.resetBtn}
                        onClick={() => {
                            setMagRange([magMin, 10]);
                            setDepthRange([0, 700]);
                        }}
                    >
                        Reset Filters
                    </button>
                </div>
            )}
        </div>
    );
}
