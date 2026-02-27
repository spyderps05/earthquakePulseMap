import { useEffect, useState } from "react";
import styles from "./styles.module.scss";

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

export default function ProfileCard({ isOpen, onClose }: Props) {
	const [isUpdating, setIsUpdating] = useState(false);
	const [updateResult, setUpdateResult] = useState<{ added?: number, total?: number, error?: string } | null>(null);

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

	// Reset result when modal opens
	useEffect(() => {
		if (isOpen) setUpdateResult(null);
	}, [isOpen]);

	const handleUpdate = async () => {
		setIsUpdating(true);
		setUpdateResult(null);
		try {
			const res = await fetch("/api/update-data", { method: "POST" });
			const data = await res.json();
			if (data.success) {
				setUpdateResult({ added: data.added, total: data.total });
			} else {
				setUpdateResult({ error: data.error || "Unknown error" });
			}
		} catch (e) {
			setUpdateResult({ error: e instanceof Error ? e.message : "Network error" });
		} finally {
			setIsUpdating(false);
		}
	};

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
						Developed by Ahmed Arsalan Rukhsar
					</p>
					<p className={styles.devRole}>
						Frontend Developer · React · TypeScript · WebGL
					</p>

					<div className={styles.updateSection}>
						<button
							type="button"
							className={styles.updateBtn}
							onClick={handleUpdate}
							disabled={isUpdating}
						>
							{isUpdating ? "Updating Database..." : "Update Local Database"}
						</button>
						{updateResult && (
							<p className={updateResult.error ? styles.errorMsg : styles.successMsg}>
								{updateResult.error
									? `Update Failed: ${updateResult.error}`
									: `Success! Added ${updateResult.added} new records. Refresh to see changes.`}
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
