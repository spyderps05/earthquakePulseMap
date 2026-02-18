import GlobeScene from "@/widgets/Globe/GlobeScene";
import styles from "./App.module.scss";

export default function App() {
	return (
		<div className={styles.container}>
			<GlobeScene />
		</div>
	);
}
