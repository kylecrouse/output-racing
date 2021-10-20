import Head from 'next/head'
import styles from '../styles/Home.module.css'
import league from '../lib/league/cache';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Protest(props) {
  return (
    <div>
      <Head>
        <title>{props.leagueName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar page="protest"/>
      
      <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSdH-nRenusYWx1CzQ7E4F-p0VjHoLkorNgCUTGT33ZGYC4TPQ/viewform?embedded=true"  frameBorder="0">Loading…</iframe>

      <Footer {...props}/>

    </div>
  )
}

export async function getStaticProps() {
  // Get data from CMS
  const { name } = await league.load();

  return { props: { 
    leagueName: name
  }};
}