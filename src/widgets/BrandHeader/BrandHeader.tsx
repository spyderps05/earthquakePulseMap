import styles from "./BrandHeader.module.scss";

export default function BrandHeader() {
    return (
        <div className={styles.header} role="banner">
            <img
                src="/branding/favicon.png"
                alt=""
                className={styles.logo}
                aria-hidden="true"
            />
            <div className={styles.text}>
                <span className={styles.brand}>GIMU</span>
                <span className={styles.separator}>·</span>
                <span className={styles.title}>EarthQuake Watch</span>
            </div>
        </div>
    );
}
