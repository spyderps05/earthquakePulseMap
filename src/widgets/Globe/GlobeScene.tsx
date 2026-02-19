import { Canvas } from "@react-three/fiber";
import { useState } from "react";

import GlobeContent from "./GlobeContent";
import styles from "./GlobeScene.module.scss";
import GlobeControls from "./ui/GlobeControls";

export default function GlobeScene() {
	const [isRotating, setIsRotating] = useState(true);

	return (
		<div className={styles.canvasWrapper}>
			<Canvas camera={{ position: [0, 0, 4], fov: 30 }}>
				<GlobeContent isRotating={isRotating} />
			</Canvas>

			<GlobeControls
				isRotating={isRotating}
				onToggle={() => setIsRotating((prev) => !prev)}
			/>
		</div>
	);
}
