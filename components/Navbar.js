import styles from '../styles/Navbar.module.css';

export default function Navbar(props) {
  return (
    <header className={`navbar ${styles.navbar}`}>
      <div className="container">
        <div className="columns col-gapless">
          <div className={`column col-8 col-mx-auto ${styles.navbarContent}`}>
            <section className="navbar-section">
              <a href="/" className="navbar-brand mr-2">
                <img src="/logo.png" alt="Output Racing" className={styles.logo}/>
              </a>
            </section>
            <section className="navbar-section">
              <a href="/drivers/" className={`btn btn-link ${styles.navItem}`}>Drivers</a>
              <a href={`/schedule/${props.seasonId}/`} className={`btn btn-link ${styles.navItem}`}>Schedule</a>
              <a href={`/standings/${props.seasonId}/`} className={`btn btn-link ${styles.navItem}`}>Standings</a>
              <a href={`/rules/`} className={`btn btn-link ${styles.navItem}`}>Rules</a>
              <a href={`/apply/`} className={`btn btn-link ${styles.navItem}`}>Apply</a>
            </section>
          </div>
        </div>
      </div>
    </header>
  );
}