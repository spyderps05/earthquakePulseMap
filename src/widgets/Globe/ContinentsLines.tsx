import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";

type GeoJSON = {
	type: string;
	features: {
		geometry: {
			type: "LineString" | "MultiLineString";
			coordinates: number[][] | number[][][];
		};
	}[];
};

const RADIUS = 1.001;

function latLonToVector3(lat: number, lon: number, radius: number) {
	const phi = (90 - lat) * (Math.PI / 180);
	const theta = (lon + 180) * (Math.PI / 180);

	const x = -radius * Math.sin(phi) * Math.cos(theta);
	const z = radius * Math.sin(phi) * Math.sin(theta);
	const y = radius * Math.cos(phi);

	return new THREE.Vector3(x, y, z);
}

export default function ContinentsLines() {
	const [geoData, setGeoData] = useState<GeoJSON | null>(null);

	useEffect(() => {
		fetch("/data/coastline.geojson")
			.then((res) => res.json())
			.then((data) => setGeoData(data));
	}, []);

	const geometry = useMemo(() => {
		if (!geoData) return null;

		const vertices: number[] = [];

		geoData.features.forEach((feature) => {
			const { geometry } = feature;

			const processLine = (coords: number[][]) => {
				for (let i = 0; i < coords.length - 1; i++) {
					const [lon1, lat1] = coords[i];
					const [lon2, lat2] = coords[i + 1];

					if (Math.abs(lon1 - lon2) > 180) continue;

					const v1 = latLonToVector3(lat1, lon1, RADIUS);
					const v2 = latLonToVector3(lat2, lon2, RADIUS);

					vertices.push(v1.x, v1.y, v1.z);
					vertices.push(v2.x, v2.y, v2.z);
				}
			};

			if (geometry.type === "LineString") {
				processLine(geometry.coordinates as number[][]);
			}

			if (geometry.type === "MultiLineString") {
				(geometry.coordinates as number[][][]).forEach(processLine);
			}
		});

		const buffer = new THREE.BufferGeometry();
		buffer.setAttribute(
			"position",
			new THREE.Float32BufferAttribute(vertices, 3),
		);

		return buffer;
	}, [geoData]);

	if (!geometry) return null;

	return (
		<lineSegments geometry={geometry}>
			<shaderMaterial
				transparent
				blending={THREE.AdditiveBlending}
				depthWrite={false}
				uniforms={{
					uColor: { value: new THREE.Color("#4bffea") },
					uIntensity: { value: 1.2 },
				}}
				vertexShader={`
        varying float vIntensity;

        void main() {
          vIntensity = 1.0;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
				fragmentShader={`
        uniform vec3 uColor;
        uniform float uIntensity;
        varying float vIntensity;

        void main() {
          float glow = vIntensity * uIntensity;
          gl_FragColor = vec4(uColor * glow, glow);
        }
      `}
			/>
		</lineSegments>
	);
}
