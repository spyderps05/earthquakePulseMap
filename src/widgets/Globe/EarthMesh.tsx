import * as THREE from "three";

export default function EarthMesh() {
	return (
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
	);
}
