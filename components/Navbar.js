import styles from '../styles/Navbar.module.css';

export default function Navbar(props) {
  return (
    <header className={`navbar ${styles.navbar}`}>
      <div class="container">
        <div className="columns col-gapless">
          <div className={`column col-8 col-mx-auto ${styles.navbarContent}`}>
            <section className="navbar-section">
              <a href="/" className="navbar-brand mr-2">
                <img src="/logo.png" alt="Output Racing" className={styles.logo}/>
              </a>
            </section>
            <section className="navbar-section">
              <a href="/drivers.html" className={`btn btn-link ${styles.navItem}`}>Drivers</a>
              <a href={`/schedule/${props.seasonId}.html`} className={`btn btn-link ${styles.navItem}`}>Schedule</a>
              <a href={`/standings/${props.seasonId}.html`} className={`btn btn-link ${styles.navItem}`}>Standings</a>
            </section>
          </div>
        </div>
      </div>
    </header>
  );
}