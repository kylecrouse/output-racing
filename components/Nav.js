import styles from '../styles/Nav.module.css';

export default function Nav(props) {
  return (
    <nav className={styles.nav}>
      <a href="/drivers/" className={props.page === 'drivers' ? 'active' : ''}>
        <span>Drivers</span>
      </a>
      <a href={`/schedule/${props.seasonId}/`} className={props.page === 'schedule' ? 'active' : ''}>
        <span>Schedule</span>
      </a>
      <a href={`/standings/${props.seasonId}/`} className={props.page === 'standings' ? 'active' : ''}>
        <span>Standings</span>
      </a>
      <a href="/rules/" className={props.page === 'rules' ? 'active' : ''}>
        <span>Rules</span>
      </a>
      <a href="/apply/" className={props.page === 'apply' ? 'active' : ''}>
        <span>Apply</span>
      </a>
    </nav>
  );
}