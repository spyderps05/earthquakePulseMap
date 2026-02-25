import rotationOff from "@/shared/assets/icons/rotation-off.svg";
import rotationOn from "@/shared/assets/icons/rotation-on.svg";
import { useTime } from "@/shared/context/TimeContext";
import styles from "./styles.module.scss";

export default function RotationButton() {
	const { isRotating, toggleRotation } = useTime();

	return (
		<button
			type="button"
			className={`${styles.button} ${isRotating ? styles.active : styles.inactive}`}
			onClick={toggleRotation}
			aria-label={isRotating ? "Stop rotation" : "Start rotation"}
			title={isRotating ? "Stop auto-rotation" : "Start auto-rotation"}
		>
			<img src={isRotating ? rotationOn : rotationOff} alt="" />
		</button>
	);
}
