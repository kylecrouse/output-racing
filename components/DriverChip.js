import styles from '../styles/DriverChip.module.css'

export default function DriverChip(props) {
  return props.active ? (
    <a href={`/driver/${props.name.replace(/\s/g, '-').toLowerCase()}/`} className={styles.container}>
      <NumberArt {...props.numberArt}/>
      {props.nickname || props.name}
    </a>    
  ) : (
    <div className={styles.container}>
      <NumberArt {...props.numberArt}/>
      {props.nickname || props.name}
    </div>    
  );
}

function NumberArt(props) {
  return props.fields ? (
    <div className={styles.numberArtContainer}>
      <img className={styles.numberArt} src={ props.fields.file.url } style={{ width: "100%" }} />
    </div>
  ) : null;
}