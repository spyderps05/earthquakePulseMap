import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.join(__dirname, "../public/data/earthquakes-1900-2026.json");
const outputBinPath = path.join(__dirname, "../public/data/earthquakes.data");
const outputStatsPath = path.join(__dirname, "../public/data/earthquakes-stats.json");
const RADIUS = 1.02;

function latLonToXYZ(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return [x, y, z];
}

export async function mergeAndRebuildData() {
    console.log("[Updater] Fetching late 7-day data from USGS...");
    const WEEK_GEOJSON_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

    const res = await fetch(WEEK_GEOJSON_URL);
    if (!res.ok) throw new Error("Failed to fetch USGS data");
    const recentData = await res.json();
    const recentFeatures = recentData.features || [];
    console.log(`[Updater] Downloaded ${recentFeatures.length} recent earthquakes`);

    console.log("[Updater] Loading local historic JSON...");
    const raw = fs.readFileSync(inputPath, "utf-8");
    const geo = JSON.parse(raw);
    const historicFeatures = geo.features || [];

    // Merge deduplicating by ID
    console.log("[Updater] Merging datasets and removing duplicates...");
    const idMap = new Map();

    // Add historic first
    for (const f of historicFeatures) {
        if (f.id) idMap.set(f.id, f);
    }

    // Add recent (overwrites if ID matches, but newer data is better anyway)
    let added = 0;
    let skipped = 0;
    let timeMin = Infinity;
    let timeMax = -Infinity;

    for (const f of recentFeatures) {
        // Only want mag >= 2.5 and valid coords to match our standard filter
        const mag = f.properties?.mag;
        const coords = f.geometry?.coordinates;
        if (typeof mag === "number" && mag >= 2.5 && Array.isArray(coords) && coords.length >= 2) {
            if (!idMap.has(f.id)) {
                idMap.set(f.id, f);
                added++;
            } else {
                skipped++;
            }
        }
    }

    console.log(`[Updater] Added ${added} new earthquakes (skipped ${skipped} duplicates).`);

    const mergedFeatures = Array.from(idMap.values()).sort((a, b) => a.properties.time - b.properties.time);
    geo.features = mergedFeatures;

    console.log("[Updater] Saving updated historic JSON...");
    fs.writeFileSync(inputPath, JSON.stringify(geo)); // save without indentation to save space

    // Now rebuild the binary file exactly like convert-earthquakes.js does
    console.log("[Updater] Rebuilding optimized binary Buffer...");

    const validFeatures = mergedFeatures.filter(
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

    // Use actual start and end times from the data for time normalization
    let start = Infinity;
    let end = -Infinity;
    for (const f of validFeatures) {
        if (f.properties.time < start) start = f.properties.time;
        if (f.properties.time > end) end = f.properties.time;
    }
    const duration = end - start;

    for (const feature of validFeatures) {
        const [lon, lat, depthRaw] = feature.geometry.coordinates;
        const mag = typeof feature.properties.mag === "number" ? feature.properties.mag : 6;
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
    console.log(`[Updater] Binary file rebuilt: ${count} total points.`);

    const stats = {
        totalCount: count,
        minMagnitude: Number(minMag.toFixed(2)),
        maxMagnitude: Number(maxMag.toFixed(2)),
        minDepth: Number(minDepth.toFixed(2)),
        maxDepth: Number(maxDepth.toFixed(2)),
        startYear: new Date(start).getUTCFullYear(),
        endYear: new Date(end).getUTCFullYear(),
    };

    fs.writeFileSync(outputStatsPath, JSON.stringify(stats, null, 2));
    console.log("[Updater] Stats file rebuilt.");
    console.log("[Updater] Operation completed successfully.");
    return { added, total: count };
}
