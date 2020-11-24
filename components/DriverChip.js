import styles from '../styles/DriverChip.module.css'

export default function DriverChip(driver) {
  return (
    <a href={`/driver/${driver.sys.id}.html`} className={styles.container}>
      { driver.fields.numberArt &&
          <div className={styles.numberArtContainer}>
            <img className={styles.numberArt} src={ driver.fields.numberArt.fields.file.url } style={{ width: "100%" }} />
          </div>
      }
      {driver.fields.nickname || driver.fields.name}
    </a>    
  );
}