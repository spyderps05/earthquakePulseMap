import * as THREE from "three";

export default function EarthMesh() {
	return (
		<>
			{/* Invisible depth-only sphere to occlude back-face earthquake points */}
			<mesh renderOrder={-1}>
				<sphereGeometry args={[1, 64, 64]} />
				<meshBasicMaterial
					colorWrite={false}
					depthWrite
					side={THREE.FrontSide}
				/>
			</mesh>

			{/* Visual translucent earth sphere */}
			<mesh>
				<sphereGeometry args={[1, 64, 64]} />
				<meshStandardMaterial
					color="#11131c"
					transparent
					opacity={0.1}
					roughness={1}
					metalness={0}
					depthWrite={false}
					side={THREE.DoubleSide}
				/>
			</mesh>
		</>
	);
}
