import { useRef } from "react";
import type { EarthquakeMetaItem } from "./earthquakes/types";
import styles from "./EarthquakeTooltip.module.scss";

interface TooltipProps {
    item: EarthquakeMetaItem | null;
    screenX: number;
    screenY: number;
}

export default function EarthquakeTooltip({ item, screenX, screenY }: TooltipProps) {
    const ref = useRef<HTMLDivElement>(null);

    if (!item) return null;

    const depthLabel =
        item.depth >= 0 ? `${item.depth.toFixed(1)} km` : "Unknown";

    const dateLabel = (() => {
        if (!item.time) return "";
        const d = new Date(item.time);
        if (d.getFullYear() < 1970) {
            // historic data — time is normalized 0–1, so we compute the year
            return "";
        }
        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            timeZone: "UTC",
        });
    })();

    return (
        <div
            ref={ref}
            className={styles.tooltip}
            style={{
                left: screenX + 14,
                top: screenY - 10,
            }}
        >
            <div className={styles.place}>{item.place}</div>
            <div className={styles.details}>
                <span>M {item.mag.toFixed(1)}</span>
                <span className={styles.sep}>·</span>
                <span>{depthLabel} deep</span>
            </div>
            {dateLabel && <div className={styles.date}>{dateLabel}</div>}
        </div>
    );
}
