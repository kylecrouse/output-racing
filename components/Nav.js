import styles from '../styles/Nav.module.css';

export default function Nav(props) {
  return (
    <nav className={styles.nav}>
      <a href="/drivers/" className={props.page === 'drivers' ? styles.active : ''}>
        <span>Drivers</span>
      </a>
      <a href={`/schedule/${props.seasonId}/`} className={props.page === 'schedule' ? styles.active : ''}>
        <span>Schedule</span>
      </a>
      <a href={`/standings/${props.seasonId}/`} className={props.page === 'standings' ? styles.active : ''}>
        <span>Standings</span>
      </a>
      <a href="/rules/" className={props.page === 'rules' ? styles.active : ''}>
        <span>Rules</span>
      </a>
      <a href="/apply/" className={props.page === 'apply' ? styles.active : ''}>
        <span>Apply</span>
      </a>
    </nav>
  );
}