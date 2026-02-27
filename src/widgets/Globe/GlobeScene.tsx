import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import ErrorToast from "@/shared/ui/ErrorToast";
import LoadingOverlay from "@/shared/ui/LoadingOverlay";
import { TimeProvider, useTime } from "@/shared/context/TimeContext";
import BrandHeader from "@/widgets/BrandHeader/BrandHeader";
import FilterPanel from "@/widgets/FilterPanel/FilterPanel";
import OnboardingOverlay from "@/widgets/OnboardingOverlay/OnboardingOverlay";
import TimelineChartAm from "@/widgets/TimelineChart/TimelineChartAm";
import MobileTimeline from "@/widgets/TimelineChart/MobileTimeline";
import InfoPanels from "../InfoPanels/InfoPanels";
import ProfileCard from "../ProfileCard/ProfileCard";
import EarthquakeTooltip from "./EarthquakeTooltip";
import GlobeContent from "./GlobeContent";
import styles from "./GlobeScene.module.scss";
import GlobeControls from "./ui/GlobeControls";
import type { EarthquakeMetaItem } from "./earthquakes/types";

export default function GlobeScene() {
	return (
		<TimeProvider>
			<GlobeSceneInner />
		</TimeProvider>
	);
}

function GlobeSceneInner() {
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(() =>
		typeof window !== "undefined" ? window.innerWidth < 768 : false,
	);
	const [isInfoOpen, setIsInfoOpen] = useState(() =>
		typeof window !== "undefined" ? window.innerWidth >= 768 : true,
	);

	const [dataError, setDataError] = useState<string | null>(null);
	const [isDataLoading, setIsDataLoading] = useState(true);

	const { mode, setMode } = useTime();

	// Tooltip state
	const [tooltipItem, setTooltipItem] = useState<EarthquakeMetaItem | null>(null);
	const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

	// Zoom target ref — will be read by GlobeContent
	const zoomTargetRef = useRef<{ lat: number; lon: number } | null>(null);

	useEffect(() => {
		const media = window.matchMedia("(max-width: 767px)");

		const handleResize = () => {
			const mobile = media.matches;
			setIsMobile(mobile);
			setIsInfoOpen(!mobile);
		};

		handleResize();
		media.addEventListener("change", handleResize);

		return () => {
			media.removeEventListener("change", handleResize);
		};
	}, []);

	// Track initial data load
	useEffect(() => {
		const timer = setTimeout(() => setIsDataLoading(false), 3000);
		return () => clearTimeout(timer);
	}, []);

	// Register service worker for offline support
	useEffect(() => {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker
				.register("/sw.js")
				.catch(() => {
					// SW registration failed — not critical
				});
		}
	}, []);

	const retryLoad = useCallback(() => {
		setDataError(null);
		window.location.reload();
	}, []);

	const handleHover = useCallback(
		(item: EarthquakeMetaItem | null, screenX: number, screenY: number) => {
			setTooltipItem(item);
			setTooltipPos({ x: screenX, y: screenY });
		},
		[],
	);

	const handleClick = useCallback((item: EarthquakeMetaItem) => {
		zoomTargetRef.current = { lat: item.lat, lon: item.lon };
	}, []);

	return (
		<div className={styles.canvasWrapper} role="application" aria-label="GIMU-EarthQuake Watch 3D Globe">
			{isDataLoading && <LoadingOverlay />}
			<OnboardingOverlay />

			<Canvas frameloop="demand" camera={{ position: [0, 0, 4], fov: 30 }}>
				<GlobeContent
					onHover={handleHover}
					onClick={handleClick}
					zoomTargetRef={zoomTargetRef}
				/>
			</Canvas>

			<EarthquakeTooltip
				item={tooltipItem}
				screenX={tooltipPos.x}
				screenY={tooltipPos.y}
			/>

			<BrandHeader />

			<div className={styles.modeSwitch}>
				<button
					type="button"
					className={`${styles.segment} ${mode === "historic" ? styles.activeSegment : ""
						}`}
					onClick={() => setMode("historic")}
					aria-label="Switch to historic earthquake data (1900-2026)"
				>
					Historic
				</button>

				<button
					type="button"
					className={`${styles.segment} ${mode === "week" ? styles.activeSegment : ""
						}`}
					onClick={() => setMode("week")}
					aria-label="Switch to last 7 days earthquake data"
				>
					Last 7 days
				</button>
			</div>

			<button
				type="button"
				className={styles.profileBtn}
				onClick={() => setIsProfileOpen(true)}
				aria-label="Open project info"
				title="About GIMU-EarthQuake Watch"
			>
				<img src="/branding/favicon.png" alt="" className={styles.profileIcon} />
			</button>
			{isMobile && !isInfoOpen && (
				<button
					type="button"
					className={styles.infoBtn}
					onClick={() => setIsInfoOpen(true)}
					aria-label="Open info panels"
				>
					<span aria-hidden="true">i</span>
				</button>
			)}

			<ProfileCard
				isOpen={isProfileOpen}
				onClose={() => setIsProfileOpen(false)}
			/>

			{isMobile ? (
				<>
					<MobileTimeline />
				</>
			) : (
				<TimelineChartAm />
			)}

			{(!isMobile || isInfoOpen) && (
				<InfoPanels
					showMobileClose={isMobile}
					onMobileClose={() => setIsInfoOpen(false)}
				/>
			)}

			<GlobeControls />
			<FilterPanel />

			{dataError && (
				<ErrorToast
					message={dataError}
					onRetry={retryLoad}
					onDismiss={() => setDataError(null)}
				/>
			)}
		</div>
	);
}
