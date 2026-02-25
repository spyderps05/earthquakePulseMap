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
import type { DataMode, PointsPayload } from "./types";

function buildWeekPointsPayload(events: WeekEarthquakeEvent[]): PointsPayload {
	const stride = 6;
	const packed = new Float32Array(events.length * stride);
	const baseRadius = 1.02;

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
	}

	return {
		mode: "week",
		data: packed,
		maxDepth: maxDepthForRadius,
	};
}

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
		if (cached) {
			setHistoricPayload({ mode: "historic", data: cached, maxDepth: 700 });
			return;
		}

		const controller = new AbortController();
		setHistoricPayload(null);
		setIsLoading(true);
		setError(null);

		loadHistoricRaw(controller.signal)
			.then((data) => {
				setHistoricPayload({ mode: "historic", data, maxDepth: 700 });
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
