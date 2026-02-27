import { useEffect, useState } from "react";
import {
	getCachedHistoricStats,
	loadHistoricStats,
} from "@/shared/api/earthquakes/historic.store";
import {
	type EarthquakeStats,
	useWeekEarthquakesData,
} from "@/shared/api/earthquakes/useEarthquakesData";
import { useTime } from "@/shared/context/TimeContext";

export function useInfoStats() {
	const { mode } = useTime();
	const { data: weekData } = useWeekEarthquakesData(mode === "week");
	const [historicStats, setHistoricStats] = useState<EarthquakeStats | null>(
		() => getCachedHistoricStats(),
	);

	useEffect(() => {
		if (mode !== "historic") return;

		const cached = getCachedHistoricStats();
		if (cached) {
			setHistoricStats(cached);
			return;
		}

		const controller = new AbortController();

		loadHistoricStats(controller.signal)
			.then((data) => {
				setHistoricStats(data);
			})
			.catch(() => {
				// handled by error boundary
			});

		return () => controller.abort();
	}, [mode]);

	if (mode === "week") return weekData?.stats ?? null;
	return historicStats;
}
