import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { type RefObject, useEffect, useRef } from "react";
import * as THREE from "three";

import { useTime } from "@/shared/context/TimeContext";
import { latLonToUnitVec3 } from "@/shared/utils/geo";
import ContinentsLines from "./ContinentsLines";
import EarthMesh from "./EarthMesh";
import EarthquakesPoints, { type EarthquakesHandle } from "./earthquakes/EarthquakesPoints";
import type { EarthquakeMetaItem } from "./earthquakes/types";

interface GlobeContentProps {
	onHover?: (item: EarthquakeMetaItem | null, screenX: number, screenY: number) => void;
	onClick?: (item: EarthquakeMetaItem) => void;
	zoomTargetRef?: RefObject<{ lat: number; lon: number } | null>;
}

export default function GlobeContent({ onHover, onClick, zoomTargetRef }: GlobeContentProps) {
	const { isRotating } = useTime();
	const globeRef = useRef<THREE.Group>(null);
	const eqRef = useRef<EarthquakesHandle>(null);
	const invalidate = useThree((s) => s.invalidate);
	const { camera, gl } = useThree();

	const raycaster = useRef(new THREE.Raycaster());
	raycaster.current.params.Points = { threshold: 0.04 };

	// Store callbacks in refs so event listeners always see latest
	const onHoverRef = useRef(onHover);
	const onClickRef = useRef(onClick);
	onHoverRef.current = onHover;
	onClickRef.current = onClick;

	const mouseNDC = useRef(new THREE.Vector2());

	// Zoom animation state
	const zoomAnimRef = useRef<{
		targetQuat: THREE.Quaternion;
		startQuat: THREE.Quaternion;
		progress: number;
		active: boolean;
	}>({
		targetQuat: new THREE.Quaternion(),
		startQuat: new THREE.Quaternion(),
		progress: 0,
		active: false,
	});

	useFrame((_, delta) => {
		if (globeRef.current) {
			// Check for zoom target
			if (zoomTargetRef?.current) {
				const { lat, lon } = zoomTargetRef.current;
				zoomTargetRef.current = null; // consume the target

				// Calculate globe rotation to face eqk towards camera
				const pointDir = latLonToUnitVec3(lat, lon).normalize();

				// We need a rotation that takes pointDir directly to the camera's direction
				const cameraDir = camera.position.clone().normalize();
				const quat = new THREE.Quaternion().setFromUnitVectors(pointDir, cameraDir);

				zoomAnimRef.current.startQuat.copy(globeRef.current.quaternion);
				zoomAnimRef.current.targetQuat.copy(quat);
				zoomAnimRef.current.progress = 0;
				zoomAnimRef.current.active = true;
			}

			// Animate zoom rotation
			if (zoomAnimRef.current.active) {
				const anim = zoomAnimRef.current;
				anim.progress = Math.min(anim.progress + delta * 1.2, 1);

				// Smooth easing
				const t = 1 - (1 - anim.progress) ** 3;

				globeRef.current.quaternion.copy(anim.startQuat).slerp(anim.targetQuat, t);

				if (anim.progress >= 1) {
					anim.active = false;
				}

				invalidate();
			} else if (isRotating) {
				globeRef.current.rotateY(0.001); // Spin around local Y axis cleanly
				invalidate();
			}
		}
	});

	useEffect(() => {
		const dom = gl.domElement;

		const doRaycast = (e: PointerEvent | MouseEvent) => {
			if (!eqRef.current?.points) return null;

			const rect = dom.getBoundingClientRect();
			mouseNDC.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
			mouseNDC.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

			raycaster.current.setFromCamera(mouseNDC.current, camera);

			const intersects = raycaster.current.intersectObject(eqRef.current.points);

			if (intersects.length > 0 && intersects[0].index !== undefined) {
				const idx = intersects[0].index;
				const meta = eqRef.current.meta;
				if (idx < meta.length) return { item: meta[idx], x: e.clientX, y: e.clientY };
			}
			return null;
		};

		// Throttle hover raycasting to avoid perf issues
		let hoverRafId = 0;
		const handleMove = (e: PointerEvent) => {
			cancelAnimationFrame(hoverRafId);
			hoverRafId = requestAnimationFrame(() => {
				const hit = doRaycast(e);
				if (hit) {
					onHoverRef.current?.(hit.item, hit.x, hit.y);
					dom.style.cursor = "pointer";
				} else {
					onHoverRef.current?.(null, 0, 0);
					dom.style.cursor = "";
				}
			});
		};

		// Drag-aware click: only fire if pointer hasn't moved much
		let downX = 0;
		let downY = 0;
		const DRAG_THRESHOLD = 5; // px

		const handlePointerDown = (e: PointerEvent) => {
			downX = e.clientX;
			downY = e.clientY;
		};

		const handlePointerUp = (e: PointerEvent) => {
			const dx = e.clientX - downX;
			const dy = e.clientY - downY;
			if (dx * dx + dy * dy > DRAG_THRESHOLD * DRAG_THRESHOLD) return; // was a drag

			const hit = doRaycast(e);
			if (hit) {
				onClickRef.current?.(hit.item);
			}
		};

		dom.addEventListener("pointermove", handleMove);
		dom.addEventListener("pointerdown", handlePointerDown);
		dom.addEventListener("pointerup", handlePointerUp);

		return () => {
			cancelAnimationFrame(hoverRafId);
			dom.removeEventListener("pointermove", handleMove);
			dom.removeEventListener("pointerdown", handlePointerDown);
			dom.removeEventListener("pointerup", handlePointerUp);
			dom.style.cursor = "";
		};
	}, [camera, gl]);

	return (
		<>
			<ambientLight intensity={0.6} />
			<directionalLight position={[5, 5, 5]} intensity={1} />

			<group ref={globeRef}>
				<EarthMesh />
				<ContinentsLines />
				<EarthquakesPoints ref={eqRef} />
			</group>

			<OrbitControls
				enablePan={false}
				maxDistance={6}
				minPolarAngle={0.1}
				maxPolarAngle={Math.PI - 0.1}
				onChange={() => invalidate()}
			/>
		</>
	);
}
