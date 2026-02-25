import { useMemo, useRef, useCallback } from "react";
import { useWeekEarthquakesData } from "@/shared/api/earthquakes/useEarthquakesData";
import { useTime } from "@/shared/context/TimeContext";
import { pad2 } from "@/shared/utils/format";
import styles from "./MobileTimeline.module.scss";

export default function MobileTimeline() {
    const { mode, isAllMode, currentDate, currentTimeRef, setCurrentTime } =
        useTime();
    const { data: weekData } = useWeekEarthquakesData(mode === "week");
    const barRef = useRef<HTMLDivElement>(null);

    const progress = currentTimeRef.current;

    const label = useMemo(() => {
        if (mode === "week") {
            const range = weekData?.range;
            if (!range) return "Last 7 days";
            const start = new Date(range.startMs);
            const end = new Date(range.endMs);
            return `${pad2(start.getUTCMonth() + 1)}/${pad2(start.getUTCDate())} — ${pad2(end.getUTCMonth() + 1)}/${pad2(end.getUTCDate())}`;
        }
        if (isAllMode) return "1900 — 2026";
        return `${currentDate.getUTCFullYear()}.${pad2(currentDate.getUTCMonth() + 1)}`;
    }, [mode, isAllMode, currentDate, weekData]);

    const handleBarClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (mode === "week" || isAllMode) return;
            const rect = barRef.current?.getBoundingClientRect();
            if (!rect) return;
            const x = (e.clientX - rect.left) / rect.width;
            setCurrentTime(Math.min(Math.max(x, 0), 1));
        },
        [mode, isAllMode, setCurrentTime],
    );

    const displayProgress = mode === "week" || isAllMode ? 1 : progress;

    return (
        <div className={styles.wrapper}>
            <span className={styles.label}>{label}</span>
            <div
                ref={barRef}
                className={styles.bar}
                onClick={handleBarClick}
                onKeyDown={() => { }}
                role="progressbar"
                aria-valuenow={Math.round(displayProgress * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Timeline progress"
                tabIndex={0}
            >
                <div
                    className={styles.fill}
                    style={{ width: `${displayProgress * 100}%` }}
                />
                {mode === "historic" && !isAllMode && (
                    <div
                        className={styles.scrubber}
                        style={{ left: `${displayProgress * 100}%` }}
                    />
                )}
            </div>
        </div>
    );
}
