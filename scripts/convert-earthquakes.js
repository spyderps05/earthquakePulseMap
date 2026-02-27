import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(
	__dirname,
	"../public/data/earthquakes-1900-2026.json",
);

const outputBinPath = path.join(__dirname, "../public/data/earthquakes.data");

const outputStatsPath = path.join(
	__dirname,
	"../public/data/earthquakes-stats.json",
);

const RADIUS = 1.02;

function latLonToXYZ(lat, lon, radius) {
	const phi = (90 - lat) * (Math.PI / 180);
	const theta = (lon + 180) * (Math.PI / 180);

	const x = -radius * Math.sin(phi) * Math.cos(theta);
	const z = radius * Math.sin(phi) * Math.sin(theta);
	const y = radius * Math.cos(phi);

	return [x, y, z];
}

const raw = fs.readFileSync(inputPath, "utf-8");
const geo = JSON.parse(raw);

const start = new Date("1900-01-01").getTime();
const end = new Date("2026-12-31").getTime();
const duration = end - start;

const features = geo.features;

const validFeatures = features.filter(
	(f) =>
		f.geometry?.coordinates &&
		typeof f.geometry.coordinates[0] === "number" &&
		typeof f.geometry.coordinates[1] === "number" &&
		typeof f.properties?.time === "number",
);

const count = validFeatures.length;

const buffer = new ArrayBuffer(count * 6 * 4);
const floatView = new Float32Array(buffer);

let minMag = Infinity;
let maxMag = -Infinity;

let minDepth = Infinity;
let maxDepth = -Infinity;

let offset = 0;

for (const feature of validFeatures) {
	const [lon, lat, depthRaw] = feature.geometry.coordinates;

	const mag =
		typeof feature.properties.mag === "number" ? feature.properties.mag : 6;

	const depth = typeof depthRaw === "number" ? depthRaw : -1;

	const time = feature.properties.time;

	const [x, y, z] = latLonToXYZ(lat, lon, RADIUS);

	const normalizedTime = Math.min(Math.max((time - start) / duration, 0), 1);

	floatView[offset++] = x;
	floatView[offset++] = y;
	floatView[offset++] = z;
	floatView[offset++] = mag;
	floatView[offset++] = depth;
	floatView[offset++] = normalizedTime;

	if (mag < minMag) minMag = mag;
	if (mag > maxMag) maxMag = mag;

	if (depth >= 0) {
		if (depth < minDepth) minDepth = depth;
		if (depth > maxDepth) maxDepth = depth;
	}
}

fs.writeFileSync(outputBinPath, Buffer.from(buffer));

console.log("Binary file created:", outputBinPath);
console.log("Points count:", count);

const stats = {
	totalCount: count,
	minMagnitude: Number(minMag.toFixed(2)),
	maxMagnitude: Number(maxMag.toFixed(2)),
	minDepth: Number(minDepth.toFixed(2)),
	maxDepth: Number(maxDepth.toFixed(2)),
	startYear: 1900,
	endYear: 2026,
};

fs.writeFileSync(outputStatsPath, JSON.stringify(stats, null, 2));

console.log("Stats file created:", outputStatsPath);
console.log("Stats:", stats);
