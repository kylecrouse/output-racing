import styles from '../styles/DriverChip.module.css'

export default function DriverChip(props) {
  return props.fields.active ? (
    <a href={`/driver/${props.fields.name.replace(/\s/g, '-').toLowerCase()}/`} className={styles.container}>
      <NumberArt {...props.fields.numberArt}/>
      {props.fields.nickname || props.fields.name}
    </a>    
  ) : (
    <div className={styles.container}>
      <NumberArt {...props.fields.numberArt}/>
      {props.fields.nickname || props.fields.name}
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