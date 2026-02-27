import { useEffect, useMemo, useState } from "react";
import {
	getCachedHistoricRaw,
	loadHistoricRaw,
} from "@/shared/api/earthquakes/historic.store";
import {
	useWeekEarthquakesData,
	type WeekEarthquakeEvent,
} from "@/shared/api/earthquakes/useEarthquakesData";
import { latLonToUnitVec3 } from "@/shared/utils/geo";
import type { DataMode, EarthquakeMetaItem, PointsPayload } from "./types";

// ── Historic metadata (place names from JSON) ──────────────
let cachedHistoricMeta: EarthquakeMetaItem[] | null = null;
let inFlightMetaPromise: Promise<EarthquakeMetaItem[]> | null = null;

function getCachedHistoricMeta() {
	return cachedHistoricMeta;
}

async function loadHistoricMeta(
	signal?: AbortSignal,
): Promise<EarthquakeMetaItem[]> {
	if (cachedHistoricMeta) return cachedHistoricMeta;
	if (inFlightMetaPromise) return inFlightMetaPromise;

	inFlightMetaPromise = fetch("/data/earthquakes-1900-2026.json", { signal })
		.then((res) => {
			if (!res.ok) throw new Error(`Failed to fetch earthquake JSON: ${res.status}`);
			return res.json();
		})
		.then((geo: { features?: Array<{ properties?: Record<string, unknown>; geometry?: { coordinates?: number[] } }> }) => {
			const features = geo.features ?? [];
			const meta: EarthquakeMetaItem[] = [];

			for (const f of features) {
				const coords = f.geometry?.coordinates;
				if (!coords || coords.length < 2) continue;
				if (typeof coords[0] !== "number" || typeof coords[1] !== "number") continue;
				if (typeof f.properties?.time !== "number") continue;

				meta.push({
					place: typeof f.properties?.place === "string" ? f.properties.place : "Unknown location",
					lon: coords[0],
					lat: coords[1],
					mag: typeof f.properties?.mag === "number" ? f.properties.mag : 6,
					depth: typeof coords[2] === "number" ? coords[2] : -1,
					time: f.properties.time as number,
				});
			}

			cachedHistoricMeta = meta;
			return meta;
		})
		.finally(() => {
			inFlightMetaPromise = null;
		});

	return inFlightMetaPromise;
}

// ── Week data → PointsPayload builder ───────────────────────
function buildWeekPointsPayload(events: WeekEarthquakeEvent[]): PointsPayload {
	const stride = 6;
	const packed = new Float32Array(events.length * stride);
	const baseRadius = 1.02;
	const meta: EarthquakeMetaItem[] = [];

	let observedMaxDepth = 0;
	for (const event of events) {
		if (event.depth >= 0) {
			observedMaxDepth = Math.max(observedMaxDepth, event.depth);
		}
	}

	const maxDepthForRadius = Math.max(700, observedMaxDepth || 700);

	for (let i = 0; i < events.length; i++) {
		const event = events[i];
		const v = latLonToUnitVec3(event.lat, event.lon).normalize();

		let depthNorm = 0;
		if (event.depth >= 0) {
			depthNorm = Math.min(event.depth / maxDepthForRadius, 1);
			depthNorm = depthNorm ** 0.6;
		}

		const finalRadius =
			event.depth >= 0 ? baseRadius - depthNorm * 0.35 : baseRadius;

		v.multiplyScalar(finalRadius);

		const off = i * stride;
		packed[off] = v.x;
		packed[off + 1] = v.y;
		packed[off + 2] = v.z;
		packed[off + 3] = event.mag;
		packed[off + 4] = event.depth;
		packed[off + 5] = 0;

		meta.push({
			place: event.place,
			lat: event.lat,
			lon: event.lon,
			mag: event.mag,
			depth: event.depth,
			time: event.time,
		});
	}

	return {
		mode: "week",
		data: packed,
		maxDepth: maxDepthForRadius,
		meta,
	};
}

// ── Hook ────────────────────────────────────────────────────
export function useEarthquakesData(mode: DataMode) {
	const { data: weekData } = useWeekEarthquakesData(mode === "week");
	const [historicPayload, setHistoricPayload] = useState<PointsPayload | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const weekPayload = useMemo(() => {
		if (!weekData) return null;
		return buildWeekPointsPayload(weekData.events);
	}, [weekData]);

	useEffect(() => {
		if (mode !== "historic") return;

		const cached = getCachedHistoricRaw();
		const cachedMeta = getCachedHistoricMeta();
		if (cached && cachedMeta) {
			setHistoricPayload({ mode: "historic", data: cached, maxDepth: 700, meta: cachedMeta });
			return;
		}

		const controller = new AbortController();
		setHistoricPayload(null);
		setIsLoading(true);
		setError(null);

		Promise.all([
			loadHistoricRaw(controller.signal),
			loadHistoricMeta(controller.signal),
		])
			.then(([data, meta]) => {
				setHistoricPayload({ mode: "historic", data, maxDepth: 700, meta });
				setError(null);
			})
			.catch((err) => {
				if (!controller.signal.aborted) {
					setError(
						err instanceof Error
							? err
							: new Error("Failed to load historic earthquake data"),
					);
				}
			})
			.finally(() => {
				setIsLoading(false);
			});

		return () => controller.abort();
	}, [mode]);

	const payload = mode === "week" ? weekPayload : historicPayload;

	return { payload, isLoading, error };
}
