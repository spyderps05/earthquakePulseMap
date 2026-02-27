import { useFrame, useThree } from "@react-three/fiber";
import { forwardRef, useMemo, useRef } from "react";
import * as THREE from "three";

import { useTime } from "@/shared/context/TimeContext";
import { buildGeometry } from "./buildGeometry";
import { fragmentShader, vertexShader } from "./shaders";
import { useEarthquakesData } from "./useEarthquakesData";
import type { EarthquakeMetaItem } from "./types";

export interface EarthquakesHandle {
	points: THREE.Points | null;
	meta: EarthquakeMetaItem[];
}

const EarthquakesPoints = forwardRef<EarthquakesHandle>(function EarthquakesPoints(_props, ref) {
	const { payload } = useEarthquakesData(useTime().mode);
	const materialRef = useRef<THREE.ShaderMaterial>(null);
	const pointsRef = useRef<THREE.Points>(null);
	const invalidate = useThree((s) => s.invalidate);

	const {
		mode,
		isPlaying,
		timeSpeed,
		isAllMode,
		currentTimeRef,
		setCurrentTime,
		magRange,
		depthRange,
	} = useTime();

	const uniforms = useMemo(
		() => ({
			uMaxDepth: { value: 700 },
			uCurrentTime: { value: 0 },
			uTimeSpeed: { value: 1 },
			uShowAll: { value: 0 },
			uMagMin: { value: 6 },
			uMagMax: { value: 9 },
			uMagFilterMin: { value: magRange[0] },
			uMagFilterMax: { value: magRange[1] },
			uDepthFilterMin: { value: depthRange[0] },
			uDepthFilterMax: { value: depthRange[1] },
		}),
		[],
	);

	useFrame((_, delta) => {
		if (!materialRef.current || !payload) return;

		const showAll = mode === "week" || isAllMode;

		if (mode === "historic" && isPlaying && !showAll) {
			const next = currentTimeRef.current + delta * timeSpeed * 0.02;
			setCurrentTime(next > 1 ? 0 : next);
		}

		uniforms.uCurrentTime.value = currentTimeRef.current;
		uniforms.uTimeSpeed.value = timeSpeed;
		uniforms.uShowAll.value = showAll ? 1 : 0;
		uniforms.uMaxDepth.value = payload.maxDepth;

		// Feed filter values from context into shader uniforms
		uniforms.uMagFilterMin.value = magRange[0];
		uniforms.uMagFilterMax.value = magRange[1];
		uniforms.uDepthFilterMin.value = depthRange[0];
		uniforms.uDepthFilterMax.value = depthRange[1];

		invalidate();
	});

	const geometry = useMemo(() => {
		if (!payload) return null;
		return buildGeometry(payload.data);
	}, [payload]);

	// Expose ref for raycasting
	if (typeof ref === "function") {
		ref({ points: pointsRef.current, meta: payload?.meta ?? [] });
	} else if (ref) {
		ref.current = { points: pointsRef.current, meta: payload?.meta ?? [] };
	}

	if (!geometry || !payload || payload.mode !== mode) return null;

	return (
		<points ref={pointsRef} geometry={geometry}>
			<shaderMaterial
				ref={materialRef}
				transparent
				depthWrite={false}
				depthTest
				blending={THREE.AdditiveBlending}
				uniforms={uniforms}
				vertexShader={vertexShader}
				fragmentShader={fragmentShader}
			/>
		</points>
	);
});

export default EarthquakesPoints;
