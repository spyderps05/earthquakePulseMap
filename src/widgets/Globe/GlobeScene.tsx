import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import InfoPanels from "../InfoPanels/InfoPanels";
import ProfileCard from "../ProfileCard/ProfileCard";
import GlobeContent from "./GlobeContent";
import styles from "./GlobeScene.module.scss";
import GlobeControls from "./ui/GlobeControls";

export default function GlobeScene() {
	const [isRotating, setIsRotating] = useState(true);
	const [isPlaying, setIsPlaying] = useState(true);
	const [timeSpeed, setTimeSpeed] = useState(1);
	const [isAllMode, setIsAllMode] = useState(false);
	const [isProfileOpen, setIsProfileOpen] = useState(false);

	return (
		<div className={styles.canvasWrapper}>
			<Canvas frameloop="always" camera={{ position: [0, 0, 4], fov: 30 }}>
				<GlobeContent
					isRotating={isRotating}
					isPlaying={isPlaying}
					timeSpeed={timeSpeed}
					isAllMode={isAllMode}
				/>
			</Canvas>
			<button
				type="button"
				className={styles.profileBtn}
				onClick={() => setIsProfileOpen(true)}
			>
				<img src="/src/shared/assets/icons/profile.svg" alt="Profile" />
			</button>

			<ProfileCard
				isOpen={isProfileOpen}
				onClose={() => setIsProfileOpen(false)}
			/>
			<InfoPanels />

			<GlobeControls
				isRotating={isRotating}
				onToggleRotation={() => setIsRotating((prev) => !prev)}
				isPlaying={isPlaying}
				onTogglePlay={() => setIsPlaying((prev) => !prev)}
				currentSpeed={timeSpeed}
				onChangeSpeed={setTimeSpeed}
				isAllMode={isAllMode}
				onToggleAllMode={() => setIsAllMode((prev) => !prev)}
			/>
		</div>
	);
}
