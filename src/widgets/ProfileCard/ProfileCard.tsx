import { useEffect } from "react";
import styles from "./styles.module.scss";

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

export default function ProfileCard({ isOpen, onClose }: Props) {
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEsc);
		}

		return () => {
			document.removeEventListener("keydown", handleEsc);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div className={styles.overlay}>
			<button
				type="button"
				className={styles.backdrop}
				onClick={onClose}
				aria-label="Close profile card"
			/>
			<div className={styles.card}>
				<div className={styles.imageWrapper}>
					<img src="/branding/splash.png" alt="GIMU-EarthQuake Watch" />
					<div className={styles.imageOverlay} />
				</div>

				<div className={styles.content}>
					<h2>GIMU-EarthQuake Watch</h2>
					<p className={styles.subtitle}>
						Global Seismic Activity Monitor · Powered by USGS
					</p>

					<p className={styles.devCredit}>
						Developed by Khadichabegim Naymanova
					</p>
					<p className={styles.devRole}>
						Frontend Developer · React · TypeScript · WebGL
					</p>
				</div>
			</div>
		</div>
	);
}
