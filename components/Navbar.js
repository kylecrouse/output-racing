import styles from '../styles/Navbar.module.css';
import Nav from './Nav';

export default function Navbar(props) {
  return (
    <header className={styles.navbar}>
      <div className="container">
        <div className="columns col-gapless">
          <div className="navbar column col-8 col-md-12 col-mx-auto">
            <section className={`navbar-section ${styles.navbarSection}`}>
              <a href="/" className="navbar-brand mr-2">
                <img src="/logo.png" alt="Output Racing" className={styles.logo}/>
              </a>
            </section>              
            <section className={`navbar-section ${styles.navbarSection}`}>
              <Nav {...props}/>
            </section>
          </div>
        </div>
      </div>
    </header>
  );
}