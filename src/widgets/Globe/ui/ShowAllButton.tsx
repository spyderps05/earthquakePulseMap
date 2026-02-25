import { useTime } from "@/shared/context/TimeContext";
import styles from "./styles.module.scss";

export default function ShowAllButton() {
	const { isAllMode, toggleAllMode } = useTime();

	return (
		<button
			type="button"
			className={`${styles.button} ${isAllMode ? styles.active : styles.inactive}`}
			onClick={toggleAllMode}
			aria-label={isAllMode ? "Exit show all mode" : "Show all earthquakes at once"}
			title={isAllMode ? "Back to timeline" : "Show all data"}
		>
			<span className={styles.label}>ALL</span>
		</button>
	);
}
