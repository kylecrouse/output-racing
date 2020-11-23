import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import { createClient } from 'contentful'
import moment from 'moment';

const client = createClient({
  space: '38idy44jf6uy',
  accessToken: 'hnJokTLzykmhsacKuzCdXre6Uf0LHDTMQ418DC2oZEc'
})

export default function Schedule(props) {
  return (
	<div className={styles.container}>
	  <Head>
		<title>Output Racing</title>
		<link rel="icon" href="/favicon.ico" />
	  </Head>

	  <div className={styles.navBar}>
  		<h1 className={styles.header}>Output Racing</h1>
      <ul className={styles.nav}>
        <li><a href="/drivers.html">Drivers</a></li>
        <li><a href="/schedule/10398.html">Schedule</a></li>
        <li><a href="/standings/10398.html">Standings</a></li>
      </ul>
	  </div>
	  
	  <main className={styles.main} style={{ marginTop: "5rem" }}>
	
    	<h2 style={{ marginTop: "5rem" }}>Schedule</h2>

  		<table border="1" cellPadding="10" style={{margin: "2rem 0 5rem"}}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Event</th>
            <th>Track</th>
            <th>Laps</th>
          </tr>
        </thead>
  		  <tbody>
    			{ props.schedule.filter(({ raceNo }) => raceNo !== "").map((race) => (
        		  <tr key={props.custId}>
                <td>{moment(race.date).format('MMM D, YYYY')}</td>
          			<td>
                  { race.raceId 
                      ? <a href={`/race/${race.raceId}.html`}>{race.name}</a>
                      : race.name
                  }
                </td>
          			<td>{race.track}</td>
                <td>{race.laps}</td>
        		  </tr>
        		)) 
    			}
  		  </tbody>
  		</table>
		  
	  </main>

	</div>
  )
}

export async function getStaticPaths() {
  const entries = await client.getEntries({ content_type: 'season' });
  return {
  	paths: entries.items.map(entry => ({ params: { seasonId: entry.sys.id }})),
  	fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const season = await client.getEntry(params.seasonId);
  const drivers = await client.getEntries({ content_type: "driver" });
  return { props: { ...season.fields, drivers: drivers.items }};
};
