import styles from '../styles/Navbar.module.css';

export default function Navbar(props) {
  return (
    <header className={`navbar ${styles.navbar}`}>
      <div className="container">
        <div className="columns col-gapless">
          <div className={`column col-8 col-mx-auto ${styles.navbarContent}`}>
            { !!!props.logo &&
              <section className="navbar-section">
                <a href="/" className="navbar-brand mr-2">
                  <img src="/logo.png" alt="Output Racing" className={styles.logo}/>
                </a>
              </section>              
            }
            <section className="navbar-section">
              <a href="/drivers/" className={`navItem ${props.page === 'drivers' ? 'active' : ''}`}><span>Drivers</span></a>
              <a href={`/schedule/${props.seasonId}/`} className={`navItem ${props.page === 'schedule' ? 'active' : ''}`}><span>Schedule</span></a>
              <a href={`/standings/${props.seasonId}/`} className={`navItem ${props.page === 'standings' ? 'active' : ''}`}><span>Standings</span></a>
              <a href={`/rules/`} className={`navItem ${props.page === 'rules' ? 'active' : ''}`}><span>Rules</span></a>
              <a href={`/apply/`} className={`navItem ${props.page === 'apply' ? 'active' : ''}`}><span>Apply</span></a>
            </section>
          </div>
        </div>
      </div>
    </header>
  );
}