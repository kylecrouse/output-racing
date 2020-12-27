import Head from 'next/head'
import styles from '../styles/Home.module.css'
import league from '../lib/league/cache';
import Navbar from '../components/Navbar';

export default function Rules(props) {
  return (
    <div>
      <Head>
        <title>{props.leagueName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar seasonId={props.seasonId}/>
      
      <iframe src="https://docs.google.com/forms/d/e/1FAIpQLSfqlx-RMiOXR0e0CPrpfhZ-7LLH4ewtaS__O5EkM-q7TGwXEg/viewform?embedded=true"  frameBorder="0">Loading…</iframe>

    </div>
  )
}

export async function getStaticProps() {
  // Get data from CMS
  const { name, season } = await league.load();

  return { props: { 
    leagueName: name,
    seasonId: season.id
  }};
}