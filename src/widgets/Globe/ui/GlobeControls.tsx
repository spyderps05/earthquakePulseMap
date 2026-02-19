import RotationButton from "./RotationButton";
import PlayPauseButton from "./PlayPauseButton";

import styles from "./styles.module.scss";

interface Props {
  isRotating: boolean;
  onToggleRotation: () => void;

  isPlaying: boolean;
  onTogglePlay: () => void;
}

export default function GlobeControls({
  isRotating,
  onToggleRotation,
  isPlaying,
  onTogglePlay,
}: Props) {
  return (
    <div className={styles.controls}>
      <RotationButton
        isRotating={isRotating}
        onToggle={onToggleRotation}
      />

      <PlayPauseButton
        isPlaying={isPlaying}
        onToggle={onTogglePlay}
      />
    </div>
  );
}
