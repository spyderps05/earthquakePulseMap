import type { PointsPayload } from "@/widgets/Globe/earthquakes/types";

let cachedHistoricData: Float32Array | null = null;
let cachedHistoricPayload: PointsPayload | null = null;
let inFlightPromise: Promise<Float32Array> | null = null;
let cachedStatsData: HistoricStats | null = null;
let inFlightStatsPromise: Promise<HistoricStats> | null = null;

export type HistoricStats = {
    totalCount: number;
    minMagnitude: number;
    maxMagnitude: number;
    minDepth: number;
    maxDepth: number;
    startYear: number;
    endYear: number;
};

export function getCachedHistoricRaw(): Float32Array | null {
    return cachedHistoricData;
}

export function getCachedHistoricPayload(): PointsPayload | null {
    return cachedHistoricPayload;
}

export function setCachedHistoricPayload(payload: PointsPayload) {
    cachedHistoricPayload = payload;
}

export async function loadHistoricRaw(
    signal?: AbortSignal,
): Promise<Float32Array> {
    if (cachedHistoricData) return cachedHistoricData;
    if (inFlightPromise) return inFlightPromise;

    inFlightPromise = fetch("/data/earthquakes.bin", { signal })
        .then((res) => {
            if (!res.ok) {
                throw new Error(
                    `Failed to fetch historic earthquake data: ${res.status}`,
                );
            }
            return res.arrayBuffer();
        })
        .then((buf) => {
            const data = new Float32Array(buf);
            cachedHistoricData = data;
            return data;
        })
        .finally(() => {
            inFlightPromise = null;
        });

    return inFlightPromise;
}

export function getCachedHistoricStats(): HistoricStats | null {
    return cachedStatsData;
}

export async function loadHistoricStats(
    signal?: AbortSignal,
): Promise<HistoricStats> {
    if (cachedStatsData) return cachedStatsData;
    if (inFlightStatsPromise) return inFlightStatsPromise;

    inFlightStatsPromise = fetch("/data/earthquakes-stats.json", { signal })
        .then((res) => {
            if (!res.ok) {
                throw new Error(
                    `Failed to fetch historic stats: ${res.status}`,
                );
            }
            return res.json();
        })
        .then((data) => {
            cachedStatsData = data as HistoricStats;
            return cachedStatsData;
        })
        .finally(() => {
            inFlightStatsPromise = null;
        });

    return inFlightStatsPromise;
}
