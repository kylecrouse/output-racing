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
	
  		<h2 style={{ marginTop: "5rem" }}>Standings</h2>

      <table border="1" cellPadding="5" style={{ width: "60%", marginBottom: "2rem" }}>
        <thead>
          <tr>
            <th width="2%"></th>
            <th width="2%"></th>
            <th>Driver</th>
            <th width="7%">Starts</th>
            <th width="7%">Points</th>
            <th width="7%">Behind Next</th>
            <th width="7%">Behind Leader</th>
            <th width="7%">Wins</th>
            <th width="7%">Top 5s</th>
            <th width="7%">Top 10s</th>
            <th width="7%">Total Laps</th>
            <th width="7%">Incidents per&nbsp;Race</th>
          </tr>
        </thead>
        <tbody>
          { props.standings &&
              props.standings
                .map((driver, index) => (
                  <tr style={{color: driver.driver.fields.active ? 'black' : 'silver'}}>
                    <td><b>{index + 1}</b></td>
                    <td>
                    { parseInt(driver.change, 10) > 0
                        ? <span style={{color:"green"}}>&#9650;&nbsp;{driver.change.substr(1)}</span>
                        : parseInt(driver.change, 10) < 0
                          ? <span style={{color:"red"}}>&#9660;&nbsp;{driver.change.substr(1)}</span>
                          : ''
                    }
                    </td>
                    <td>
                      <a href={`/driver/${driver.driver.sys.id}`} style={{ whiteSpace: "nowrap" }}>
                        { driver.driver.fields.numberArt &&
                          <div style={{ float: "left", marginRight: "5px", width: "22px", height: "22px", marginTop: "-1px" }}>
                            <img src={ driver.driver.fields.numberArt.fields.file.url } style={{ width: "100%", marginBottom: "2rem" }} />
                          </div>
                        }                      
                        {(driver.driver.fields.nickname || driver.driver.fields.name).replace(/ /g, '\u00a0')}
                      </a>
                    </td>
                    <td>{driver.starts}</td>
                    <td>{driver.points}</td>
                    <td>{driver.behindNext}</td>
                    <td>{driver.behindLeader}</td>
                    <td>{driver.wins}</td>
                    <td>{driver.t5s}</td>
                    <td>{driver.t10s}</td>
                    <td>{driver.laps}</td>
                    <td>{(driver.incidents / driver.starts).toFixed(2)}</td>
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
  return { props: { 
    standings: season.fields.standings.map(record => {
      console.log({ ...record, driver: drivers.items.find(driver => driver.fields.name === record.driver) });
      return { ...record, driver: drivers.items.find(driver => driver.fields.name === record.driver) };
    }) 
  }};
};
