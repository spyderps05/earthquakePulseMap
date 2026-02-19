import pauseIcon from "@/shared/assets/icons/pause.svg";
import playIcon from "@/shared/assets/icons/play.svg";

import styles from "./styles.module.scss";

interface Props {
  isPlaying: boolean;
  onToggle: () => void;
}

export default function PlayPauseButton({ isPlaying, onToggle }: Props) {
  return (
    <button
      type="button"
      className={`${styles.button} ${
        isPlaying ? styles.active : styles.inactive
      }`}
      onClick={onToggle}
    >
      <img
        src={isPlaying ? pauseIcon : playIcon}
        alt="time toggle"
      />
    </button>
  );
}
