import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import { createClient } from 'contentful'

const client = createClient({
  space: '38idy44jf6uy',
  environment: 'master',
  accessToken: 'hnJokTLzykmhsacKuzCdXre6Uf0LHDTMQ418DC2oZEc'
})

export default function Driver(props) {
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

	  <main className={styles.main} style={{marginTop: "5rem", paddingTop: "5rem"}}>

      <div>
        { props.numberArt &&
            <img src={ props.numberArt.fields.file.url } style={{ float: "left", width: "200px", marginTop: "-1rem", marginRight: "2rem" }}/>
        }
        <div style={{ float: "right" }}>
          <h2>{props.nickname || props.name}</h2>
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            <li><span style={{backgroundColor: `#${props.license.licColor}`, color: 'white'}}> {props.license.licGroupDisplayName} {props.license.srPrime}.{props.license.srSub}</span></li>
            <li>iRating: {props.license.iRating}</li>
          </ul>
        </div>

      </div>
      
      { props.seasonStats &&
          props.seasonStats.map((season, index) => (
            <div key={`stats${index}`} style={{ width: "60%" }}>
              <h3 style={{ textAlign: "center" }}>{season.name} Stats</h3>
              <table border="1" cellPadding="5" style={{ width: "100%", marginBottom: "2rem" }}>
                <thead>
                  <tr>
                    <th>Starts</th>
                    <th>Wins</th>
                    <th>Top 5s</th>
                    <th>Poles</th>
                    <th>Avg Start</th>
                    <th>Avg Finish</th>
                    <th>Total Laps</th>
                    <th>Laps Led</th>
                    <th>Inc/Race</th>
                    <th>Win %</th>
                    <th>Top 5 %</th>
                    <th>Led %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{season.starts}</td>
                    <td>{season.wins}</td>
                    <td>{season.top5s}</td>
                    <td>{season.poles}</td>
                    <td>{season.avgStart}</td>
                    <td>{season.avgFinish}</td>
                    <td>{season.laps}</td>
                    <td>{season.lapsLed}</td>
                    <td>{season.incidentsRace}</td>
                    <td>{season.winPercentage}</td>
                    <td>{season.top5Percentage}</td>
                    <td>{((parseInt(season.lapsLed) / parseInt(season.laps.replace(',',''))) * 100).toFixed(0)}%</td>
                  </tr>
                </tbody>
              </table>            
            </div>
          ))
      }
      
      <h3>iRacing Career Stats</h3>
  
  		<table border="1" cellPadding="5" style={{ width: "60%", marginBottom: "2rem" }}>
        <thead>
          <tr>
            <th>Starts</th>
            <th>Wins</th>
            <th>Top 5s</th>
            <th>Poles</th>
            <th>Avg Start</th>
            <th>Avg Finish</th>
            <th>Total Laps</th>
            <th>Laps Led</th>
            <th>Inc/Race</th>
            <th>Win %</th>
            <th>Top 5 %</th>
            <th>Led %</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{props.careerStats.starts}</td>
            <td>{props.careerStats.wins}</td>
            <td>{props.careerStats.top5}</td>
            <td>{props.careerStats.poles}</td>
            <td>{props.careerStats.avgStart}</td>
            <td>{props.careerStats.avgFinish}</td>
            <td>{props.careerStats.totalLaps}</td>
            <td>{props.careerStats.lapsLed}</td>
            <td>{props.careerStats.avgIncPerRace.toFixed(2)}</td>
            <td>{props.careerStats.winPerc.toFixed(0)}%</td>
            <td>{props.careerStats.top5Perc.toFixed(0)}%</td>
            <td>{props.careerStats.lapsLedPerc.toFixed(0)}%</td>
          </tr>
        </tbody>
  		</table>
      
	  </main>

	</div>
  )
}

export async function getStaticPaths() {
  const entries = await client.getEntries({ content_type: 'driver' });
  return {
    paths: entries.items.map(entry => ({ params: { driverId: entry.sys.id }})),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const entry = await client.getEntry(params.driverId);
  const seasons = await client.getEntries({ content_type: "season" });
  const seasonStats = seasons.items.map(({ fields }) => {
    return {
      name: fields.name,
      ...fields.stats.find(({ driver }) => driver === entry.fields.name)
    }
  });
  return { props: { ...entry.fields, seasonStats }};
};
