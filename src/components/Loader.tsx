import styles from "./Loader.module.css";

export default function Loader() {
    return (
<section className={styles["dots-container"]}>
  <div className={styles["dot"]}></div>
  <div className={styles["dot"]}></div>
  <div className={styles["dot"]}></div>
  <div className={styles["dot"]}></div>
  <div className={styles["dot"]}></div>
</section>
    );
}