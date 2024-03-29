import styles from '../styles/Nav.module.css';

export default function Nav(props) {
  return (
    <nav className={styles.nav}>
      <a href="/drivers/" className={props.page === 'drivers' ? styles.active : ''}>
        <span>Drivers</span>
      </a>
      <a href={`/schedule/`} className={props.page === 'schedule' ? styles.active : ''}>
        <span>Schedule</span>
      </a>
      <a href={`/standings/`} className={props.page === 'standings' ? styles.active : ''}>
        <span>Standings</span>
      </a>
      <a href="/rules/" className={props.page === 'rules' ? styles.active : ''}>
        <span>Rules</span>
      </a>
      <a href="/protest/" className={props.page === 'protest' ? styles.active : ''}>
        <span>Protest</span>
      </a>
      <a href="/apply/" className={props.page === 'apply' ? styles.active : ''}>
        <span>Apply</span>
      </a>
      <a href="https://shop.champsspeedshop.com/collections/t-shirts/products/output-racing-league-t-shirt" target="_blank"><span>Merch</span></a>
    </nav>
  );
}