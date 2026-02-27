export type DataMode = "historic" | "week";

export type EarthquakeMetaItem = {
	place: string;
	lat: number;
	lon: number;
	mag: number;
	depth: number;
	time: number;
};

export type PointsPayload = {
	mode: DataMode;
	data: Float32Array;
	maxDepth: number;
	meta: EarthquakeMetaItem[];
};
