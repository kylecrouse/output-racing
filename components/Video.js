import styles from '../styles/Video.module.css'

export default function Video(props) {
  return (
    <div className={styles.container} style={props.style}>
      <iframe className={styles.video} src={props.src} allowFullScreen></iframe>
    </div>
  );
}