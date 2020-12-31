import Nav from './Nav';
import styles from '../styles/Footer.module.css';

export default function Footer(props) {
  return (
    <footer className={styles.footer}>
      <Nav {...props}/>
      <p>&copy; 2020 Output Racing League</p>
    </footer>
  );
}